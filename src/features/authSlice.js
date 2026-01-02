// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
// import { getToken, removeToken } from "../utils/authToken";
// // import { API_BASE_URL } from "../../config";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // Decode JWT without external dependencies
// function decodeBase64Url(input) {
//   try {
//     let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
//     const pad = base64.length % 4;
//     if (pad) base64 += "=".repeat(4 - pad);
//     const atobFn =
//       typeof atob === "function"
//         ? atob
//         : typeof window !== "undefined" && typeof window.atob === "function"
//         ? window.atob
//         : null;
//     if (!atobFn) return null;
//     return decodeURIComponent(
//       Array.prototype.map
//         .call(
//           atobFn(base64),
//           (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
//         )
//         .join("")
//     );
//   } catch {
//     return null;
//   }
// }

// function parseJwt(token) {
//   if (!token || typeof token !== "string") return null;
//   const parts = token.split(".");
//   if (parts.length < 2) return null;
//   const json = decodeBase64Url(parts[1]);
//   try {
//     return json ? JSON.parse(json) : null;
//   } catch {
//     return null;
//   }
// }

// // Async thunk for login
// export const login = createAsyncThunk(
//   "auth/login",
//   async (credentials, thunkAPI) => {
//     try {
//       const res = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
//         headers: { "Content-Type": "application/json" },
//       });

//       // axios puts response data on res.data
//       const data = res.data;
//       return data;
//     } catch (err) {
//       // Prefer structured error returned by server, otherwise fallback to network/error message
//       const message =
//         err?.response?.data?.message || err.message || "Network error";
//       return thunkAPI.rejectWithValue({ message });
//     }
//   }
// );

// // Initialize auth from localStorage on app start
// export const initializeAuth = createAsyncThunk(
//   "auth/initialize",
//   async (_, { fulfillWithValue }) => {
//     if (typeof window === "undefined") return fulfillWithValue(null);

//     const token = getToken(); // 👈 Common JWT function
//     const raw = localStorage.getItem("auth"); // user info

//     if (token && raw) {
//       try {
//         const parsed = JSON.parse(raw);
//         const { user, roles, permissions, exp } = parsed || {};
//         const now = Date.now();

//         if (exp && now > exp) {
//           removeToken();
//           localStorage.removeItem("auth");
//           return fulfillWithValue(null);
//         }

//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//         return fulfillWithValue({
//           token,
//           user,
//           roles,
//           permissions,
//           exp,
//         });
//       } catch (error) {
//         console.error("Auth initialization failed:", error);
//         removeToken();
//         localStorage.removeItem("auth");
//         return fulfillWithValue(null); // Ensure proper state reset
//       }
//     }

//     return fulfillWithValue(null);
//   }
// );

// // Hydrate legacy `auth` shape from localStorage (keeps backward compatibility)
// export const hydrateAuth = createAsyncThunk(
//   "auth/hydrateAuth",
//   async (_, thunkAPI) => {
//     try {
//       const stored = localStorage.getItem("auth");
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         const { user, roles, permissions, exp: rawExp, token } = parsed;

//         // normalize exp to milliseconds (stored value may be seconds or ms)
//         const exp = rawExp ? (rawExp < 1e12 ? rawExp * 1000 : rawExp) : null;

//         if (!token || !exp || !permissions) {
//           return thunkAPI.rejectWithValue({ message: "Invalid stored auth" });
//         }

//         console.log("Hydrating auth...");
//         console.log("Stored auth:", localStorage.getItem("auth"));

//         return { user, roles, permissions, exp, token };
//       }
//       return thunkAPI.rejectWithValue({ message: "No stored auth" });
//     } catch {
//       return thunkAPI.rejectWithValue({ message: "Failed to hydrate auth" });
//     }
//   }
// );

// const initialState = {
//   user: null, // { username, email, firstName, lastName, userId }
//   roles: [],
//   permissions: [],
//   token: null,
//   expiresAt: null, // epoch ms
//   status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
//   error: null,
//   message: null,
//   isAuthenticated: false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout(state) {
//       state.user = null;
//       state.roles = [];
//       state.permissions = [];
//       state.token = null;
//       state.expiresAt = null;
//       state.status = "idle";
//       state.error = null;
//       state.message = null;
//       state.isAuthenticated = false;
//       // Optional: clear localStorage tokens
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("auth");
//         // Remove legacy key if still present
//         localStorage.removeItem("auth");
//       }
//       // Clear axios Authorization header
//       if (axios && axios.defaults && axios.defaults.headers) {
//         delete axios.defaults.headers.common["Authorization"];
//       }
//     },
//     clearError(state) {
//       state.error = null;
//       state.message = null;
//     },
//   },
//   extraReducers(builder) {
//     builder
//       .addCase(login.pending, (state) => {
//         state.status = "loading";
//         state.error = null;
//         state.message = null;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         const payload = action.payload || {};
//         // API may return { data: { token, user }, message, status }
//         const apiData = payload.data || payload;
//         const token = apiData?.token || apiData?.accessToken || null;
//         const decoded = token
//           ? parseJwt(token)
//           : apiData.permissions || apiData.roles
//           ? apiData
//           : null;

//         const rolesFromToken = Array.isArray(decoded?.roles)
//           ? decoded.roles
//           : [];
//         const rolesFromApi = Array.isArray(apiData?.roles) ? apiData.roles : [];
//         const roles = [
//           ...new Set([
//             ...rolesFromToken,
//             ...rolesFromApi
//               .map((r) => (typeof r === "string" ? r : r?.authority))
//               .filter(Boolean),
//           ]),
//         ];

//         const permissions = Array.isArray(decoded?.permissions)
//           ? decoded.permissions
//           : Array.isArray(apiData?.permissions)
//           ? apiData.permissions
//           : [];

//         const userFromApi = apiData?.user || {};
//         const userFromToken = decoded?.user || {};
//         const user = {
//           username:
//             userFromApi?.username ||
//             userFromToken?.username ||
//             decoded?.sub ||
//             null,
//           email: userFromApi?.email || userFromToken?.email || null,
//           firstName: userFromApi?.firstName ?? userFromToken?.firstName ?? null,
//           lastName: userFromApi?.lastName ?? userFromToken?.lastName ?? null,
//           userId: userFromApi?.userId ?? userFromToken?.userId ?? null,
//         };

//         const exp = decoded?.exp ? decoded.exp * 1000 : null;

//         state.status = "succeeded";
//         state.user = user;
//         state.roles = roles;
//         state.permissions = permissions;
//         state.token = token;
//         state.expiresAt = exp;
//         state.message = payload.message || payload.status || "success";
//         state.error = null;
//         state.isAuthenticated = Boolean(
//           token || roles.length || permissions.length
//         );

//         if (
//           (token || roles.length || permissions.length) &&
//           axios?.defaults?.headers
//         ) {
//           if (token)
//             axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         }

//         if (typeof window !== "undefined") {
//           localStorage.setItem(
//             "auth",
//             JSON.stringify({ token, user, roles, permissions, exp })
//           );
//         }
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.status = "failed";
//         state.error =
//           (action.payload && action.payload.message) || action.error.message;
//         state.message = null;
//         state.isAuthenticated = false;
//       })
//       //hydrateAuth lifecycle
//       .addCase(hydrateAuth.fulfilled, (state, action) => {
//         const { user, roles, permissions, exp, token } = action.payload;

//         // exp is normalized to milliseconds in the thunk
//         if (exp && exp < Date.now()) {
//           state.status = "failed";
//           state.user = null;
//           state.roles = [];
//           state.permissions = [];
//           state.token = null;
//           state.expiresAt = null;
//           state.isAuthenticated = false;
//           state.error = "Session expired. Please login again.";
//           // also clear storage
//           if (typeof window !== "undefined") localStorage.removeItem("auth");
//           return;
//         }

//         state.user = user;
//         state.roles = roles;
//         state.permissions = permissions;
//         state.token = token;
//         state.expiresAt = exp || null;
//         state.isAuthenticated = true;
//         state.status = "succeeded";

//         // restore axios header
//         if (token && axios?.defaults?.headers) {
//           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         }
//       })
//       .addCase(hydrateAuth.rejected, (state) => {
//         localStorage.removeItem("auth");
//         state.user = null;
//         state.roles = [];
//         state.permissions = [];
//         state.token = null;
//         state.status = "failed";
//         state.isAuthenticated = false;
//       })
//       .addCase(initializeAuth.fulfilled, (state, action) => {
//         const data = action.payload;
//         if (!data) return;
//         state.token = data.token;
//         state.user = data.user || null;
//         state.roles = data.roles || [];
//         state.permissions = data.permissions || [];
//         state.expiresAt = data.exp || null;
//         state.isAuthenticated = true;
//         if (state.status === "idle") state.status = "succeeded";
//       });
//   },
// });

// export const { logout, clearError } = authSlice.actions;

// export default authSlice.reducer;

// // Selectors
// export const selectAuth = (state) => state.auth;
// export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
// export const selectCurrentUser = (state) => state.auth.user;
// export const selectAuthRoles = (state) => state.auth.roles;
// export const selectAuthPermissions = (state) => state.auth.permissions || [];
// export const selectAuthExpiry = (state) => state.auth.expiresAt || null;
// export const selectAuthStatus = (state) => state.auth.status;
// export const selectAuthError = (state) => state.auth.error;
// export const selectAuthMessage = (state) => state.auth.message;
// export const makeSelectHasPermission = (permission) => (state) =>
//   Array.isArray(state.auth.permissions) &&
//   state.auth.permissions.includes(permission);
// export const makeSelectHasRole = (role) => (state) =>
//   Array.isArray(state.auth.roles) && state.auth.roles.includes(role);
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Swal from "sweetalert2";
import { getToken, setToken, removeToken } from "../utils/authToken"; // ✅ use friend’s helpers

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- JWT decode helpers ---
function decodeBase64Url(input) {
  try {
    let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const atobFn =
      typeof atob === "function"
        ? atob
        : typeof window !== "undefined" && typeof window.atob === "function"
        ? window.atob
        : null;
    if (!atobFn) return null;
    return decodeURIComponent(
      Array.prototype.map
        .call(
          atobFn(base64),
          (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );
  } catch {
    return null;
  }
}

function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const json = decodeBase64Url(parts[1]);
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

// --- Async thunks ---
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Network error";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { fulfillWithValue }) => {
    if (typeof window === "undefined") return fulfillWithValue(null);

    const token = getToken(); // ✅ centralized
    const raw = localStorage.getItem("auth");

    if (token && raw) {
      try {
        const parsed = JSON.parse(raw);
        const { user, roles, permissions, exp } = parsed || {};
        const now = Date.now();

        if (exp && now > exp) {
          removeToken();
          localStorage.removeItem("auth");
          return fulfillWithValue(null);
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return fulfillWithValue({ token, user, roles, permissions, exp });
      } catch {
        removeToken();
        localStorage.removeItem("auth");
        return fulfillWithValue(null);
      }
    }
    return fulfillWithValue(null);
  }
);

export const hydrateAuth = createAsyncThunk(
  "auth/hydrateAuth",
  async (_, thunkAPI) => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        const { user, roles, permissions, exp: rawExp, token } = parsed;
        const exp = rawExp ? (rawExp < 1e12 ? rawExp * 1000 : rawExp) : null;

        if (!token || !exp || !permissions) {
          return thunkAPI.rejectWithValue({ message: "Invalid stored auth" });
        }
        console.log("Hydrating auth...");
        console.log("Stored auth:", localStorage.getItem("auth"));
        return { user, roles, permissions, exp, token };
      }
      return thunkAPI.rejectWithValue({ message: "No stored auth" });
    } catch {
      return thunkAPI.rejectWithValue({ message: "Failed to hydrate auth" });
    }
  }
);

// --- State ---
const initialState = {
  user: null,
  roles: [],
  permissions: [],
  token: null,
  expiresAt: null,
  status: "idle",
  error: null,
  message: null,
  isAuthenticated: false,
  timeoutId: null, // ✅ keep your timer
};

// --- Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.roles = [];
      state.permissions = [];
      state.token = null;
      state.expiresAt = null;
      state.status = "idle";
      state.error = null;
      state.message = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        removeToken();
        localStorage.removeItem("auth");
      }
      if (axios?.defaults?.headers) {
        delete axios.defaults.headers.common["Authorization"];
      }
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
      }
    },
    clearError(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const payload = action.payload || {};
        const apiData = payload.data || payload;
        const token = apiData?.token || apiData?.accessToken || null;
        const decoded = token ? parseJwt(token) : null;

        const rolesFromToken = Array.isArray(decoded?.roles)
          ? decoded.roles
          : [];
        const rolesFromApi = Array.isArray(apiData?.roles) ? apiData.roles : [];
        const roles = [
          ...new Set([
            ...rolesFromToken,
            ...rolesFromApi
              .map((r) => (typeof r === "string" ? r : r?.authority))
              .filter(Boolean),
          ]),
        ];

        const permissions = Array.isArray(decoded?.permissions)
          ? decoded.permissions
          : apiData?.permissions || [];

        const userFromApi = apiData?.user || {};
        const userFromToken = decoded?.user || {};
        const user = {
          username:
            userFromApi?.username ||
            userFromToken?.username ||
            decoded?.sub ||
            null,
          email: userFromApi?.email || userFromToken?.email || null,
          firstName: userFromApi?.firstName ?? userFromToken?.firstName ?? null,
          lastName: userFromApi?.lastName ?? userFromToken?.lastName ?? null,
          userId: userFromApi?.userId ?? userFromToken?.userId ?? null,
        };

        const exp = decoded?.exp ? decoded.exp * 1000 : null;

        state.status = "succeeded";
        state.user = user;
        state.roles = roles;
        state.permissions = permissions;
        state.token = token;
        state.expiresAt = exp;
        state.message = payload.message || payload.status || "success";
        state.error = null;
        state.isAuthenticated = Boolean(token);

        if (token && axios?.defaults?.headers) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        // persist JWT using central helper
        if (token) setToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "auth",
            JSON.stringify({ token, user, roles, permissions, exp })
          );
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload && action.payload.message) || action.error.message;
        state.message = null;
        state.isAuthenticated = false;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        const { user, roles, permissions, exp, token } = action.payload;
        if (exp && exp < Date.now()) {
          state.status = "failed";
          state.user = null;
          state.roles = [];
          state.permissions = [];
          state.token = null;
          state.expiresAt = null;
          state.isAuthenticated = false;
          state.error = "Session expired. Please login again.";
          if (typeof window !== "undefined") localStorage.removeItem("auth");
          return;
        }

        state.user = user;
        state.roles = roles;
        state.permissions = permissions;
        state.token = token;
        state.expiresAt = exp || null;
        state.isAuthenticated = true;
        state.status = "succeeded";

        if (token && axios?.defaults?.headers) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          // persist JWT when hydrating auth
          setToken(token);
        }
      })
      .addCase(hydrateAuth.rejected, (state) => {
        localStorage.removeItem("auth");
        state.user = null;
        state.roles = [];
        state.permissions = [];
        state.token = null;
        state.status = "failed";
        state.isAuthenticated = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        const data = action.payload;
        if (!data) return;
        state.token = data.token;
        state.user = data.user || null;
        state.roles = data.roles || [];
        state.permissions = data.permissions || [];
        state.expiresAt = data.exp || null;
        state.isAuthenticated = true;
        if (state.status === "idle") state.status = "succeeded";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

// --- Selectors ---
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthRoles = (state) => state.auth.roles;
export const selectAuthPermissions = (state) => state.auth.permissions || [];
export const selectAuthExpiry = (state) => state.auth.expiresAt || null;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;

export const makeSelectHasPermission = (permission) => (state) =>
  Array.isArray(state.auth.permissions) &&
  state.auth.permissions.includes(permission);

export const makeSelectHasRole = (role) => (state) =>
  Array.isArray(state.auth.roles) && state.auth.roles.includes(role);
