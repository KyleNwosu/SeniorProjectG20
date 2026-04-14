import os
import threading
import collections
import collections.abc

# Python 3.10+ removed collections.MutableMapping aliases.
# kortex_api ships with protobuf 3.5.1 which still uses them.
for _name in (
    "Awaitable", "Coroutine", "AsyncIterable", "AsyncIterator", "AsyncGenerator",
    "Hashable", "Iterable", "Iterator", "Generator", "Reversible", "Container",
    "Collection", "Callable", "Set", "MutableSet", "Mapping", "MutableMapping",
    "MappingView", "KeysView", "ItemsView", "ValuesView",
    "Sequence", "MutableSequence", "ByteString",
):
    if not hasattr(collections, _name):
        setattr(collections, _name, getattr(collections.abc, _name))

from dotenv import load_dotenv

from kortex_api.autogen.client_stubs.BaseClientRpc import BaseClient
from kortex_api.autogen.client_stubs.BaseCyclicClientRpc import BaseCyclicClient
from kortex_api.autogen.messages import Session_pb2, Base_pb2
from kortex_api.RouterClient import RouterClient
from kortex_api.SessionManager import SessionManager
from kortex_api.TCPTransport import TCPTransport

load_dotenv()

ROBOT_IP       = os.getenv("ROBOT_IP", "192.168.1.10")
ROBOT_PORT     = int(os.getenv("ROBOT_PORT", "10000"))
ROBOT_USERNAME = os.getenv("ROBOT_USERNAME", "admin")
ROBOT_PASSWORD = os.getenv("ROBOT_PASSWORD", "admin")


def _router_error_callback(kException):
    print(f"[Robot] Router error: {kException}")


class RobotSession:
    """Holds the single persistent connection to the Kinova arm."""

    def __init__(self):
        self.transport: TCPTransport | None = None
        self.router: RouterClient | None = None
        self.session_manager: SessionManager | None = None
        self.base: BaseClient | None = None
        self.base_cyclic: BaseCyclicClient | None = None
        self._lock = threading.Lock()
        self.connected = False

    def connect(self):
        with self._lock:
            if self.connected:
                return

            self.transport = TCPTransport()
            self.transport.connect(ROBOT_IP, ROBOT_PORT)

            self.router = RouterClient(self.transport, _router_error_callback)

            session_info = Session_pb2.CreateSessionInfo()
            session_info.username = ROBOT_USERNAME
            session_info.password = ROBOT_PASSWORD
            session_info.session_inactivity_timeout = 60000   # ms
            session_info.connection_inactivity_timeout = 2000  # ms

            self.session_manager = SessionManager(self.router)
            self.session_manager.CreateSession(session_info)

            self.base = BaseClient(self.router)
            self.base_cyclic = BaseCyclicClient(self.router)

            # Twist commands require high-level (single-level) servoing mode
            servoing_mode = Base_pb2.ServoingModeInformation()
            servoing_mode.servoing_mode = Base_pb2.SINGLE_LEVEL_SERVOING
            self.base.SetServoingMode(servoing_mode)

            self.connected = True
            print(f"[Robot] Connected to {ROBOT_IP}:{ROBOT_PORT}")

    def disconnect(self):
        with self._lock:
            if not self.connected:
                return
            try:
                self.session_manager.CloseSession()
            except Exception:
                pass
            try:
                self.transport.disconnect()
            except Exception:
                pass
            self.connected = False
            print("[Robot] Disconnected")


# Singleton — imported everywhere
robot = RobotSession()
