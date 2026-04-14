const EXT_ID = "clientSpoof";
const HEADER = "x-super-properties";

/**
 * Profiles aligned with the Browser Type → Client Status Type table
 * (desktop / mobile / embedded / vr / web); see Discord client-properties docs.
 */
const PROFILE_IDS = [
  "native",
  "desktop",
  "discord_android",
  "discord_ios",
  "embedded",
  "vr",
  "android_chrome",
  "android_mobile",
  "blackberry",
  "chrome",
  "chrome_ios",
  "edge",
  "facebook_mobile",
  "firefox",
  "internet_explorer",
  "konqueror",
  "mobile_safari",
  "mozilla",
  "opera",
  "opera_mini",
  "safari",
] as const;

type Profile = (typeof PROFILE_IDS)[number];

const logger = moonlight.getLogger("clientSpoof");

/** Always visible in DevTools (Ctrl+Shift+I); moonlight’s logger may use a different prefix. */
function dbg(...args: unknown[]): void {
  // eslint-disable-next-line no-console -- intentional DevTools output
  console.info("[clientSpoof]", ...args);
}

function isProfile(v: string): v is Profile {
  return (PROFILE_IDS as readonly string[]).includes(v);
}

function getProfile(): Profile {
  const raw = moonlight.getConfigOption(EXT_ID, "profile") as
    | string
    | undefined;
  if (raw === "android") return "discord_android";
  if (raw === "ios") return "discord_ios";
  if (raw && isProfile(raw)) return raw;
  return "native";
}

/** Base64 JSON → object (UTF-8 safe). */
function decodeSuperProperties(b64: string): Record<string, unknown> | null {
  try {
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Object → base64 JSON (UTF-8 safe). */
function encodeSuperProperties(obj: Record<string, unknown>): string {
  const text = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function syncLegacyDollarKeys(props: Record<string, unknown>): void {
  if (typeof props.browser === "string") {
    props["$browser"] = props.browser;
  }
  if (typeof props.os === "string") {
    props["$os"] = props.os;
  }
}

/** Web browser on Windows (e.g. Chrome-style UA in docs). */
function applyWebWindows(
  props: Record<string, unknown>,
  browser: string,
  ua: string,
  browserVersion: string,
): void {
  props.os = "Windows";
  props.os_version = "10.0.26100";
  props.browser = browser;
  props.browser_user_agent = ua;
  props.browser_version = browserVersion;
  props.release_channel = "stable";
  props.device = "";
}

/**
 * Align visible fields with
 * [Client Properties](https://docs.discord.food/reference#client-properties).
 * Keeps original `client_build_number` / `native_build_number`.
 */
function applyProfile(props: Record<string, unknown>, profile: Profile): void {
  if (profile === "native") return;

  switch (profile) {
    /* ——— desktop ——— */
    case "desktop": {
      props.os = "Windows";
      props.browser = "Discord Client";
      props.browser_user_agent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.0 Chrome/134.0.6998.179 Electron/35.1.5 Safari/537.36";
      props.browser_version = "35.1.5";
      props.os_version = "10.0.26100";
      props.os_sdk_version = "26100";
      props.os_arch = "x64";
      props.app_arch = "x64";
      props.release_channel = "stable";
      props.client_version = "1.0.0";
      break;
    }

    /* ——— mobile (apps Discord) ——— */
    case "discord_android": {
      props.os = "Android";
      props.browser = "Discord Android";
      props.browser_user_agent = "";
      props.browser_version = "";
      props.client_version = "280.2 - rn";
      props.release_channel = "stable";
      props.design_id = 2;
      props.device = "generic";
      break;
    }
    case "discord_ios": {
      props.os = "iOS";
      props.browser = "Discord iOS";
      props.browser_user_agent = "";
      props.browser_version = "";
      props.client_version = "227.0";
      props.release_channel = "stable";
      props.design_id = 2;
      props.device = "iPhone15,2";
      break;
    }

    /* ——— embedded / vr ——— */
    case "embedded": {
      props.browser = "Discord Embedded";
      props.browser_user_agent = "Discord Embedded/0.0.8";
      props.browser_version = "0.0.8";
      props.design_id = 0;
      props.release_channel = "unknown";
      props.os = props.os ?? "Windows";
      break;
    }
    case "vr": {
      props.browser = "Discord VR";
      props.browser_user_agent = "Discord VR/1.0.0";
      props.browser_version = "1.0.0";
      break;
    }

    /* ——— web (browsers) ——— */
    case "android_chrome": {
      props.os = "Android";
      props.os_version = "14";
      props.browser = "Android Chrome";
      props.browser_user_agent =
        "Mozilla/5.0 (Linux; Android 14; en-us) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.0 Mobile Safari/537.36";
      props.browser_version = "125.0.6422.0";
      props.release_channel = "stable";
      props.device = "Pixel 8";
      break;
    }
    case "android_mobile": {
      props.os = "Android";
      props.os_version = "14";
      props.browser = "Android Mobile";
      props.browser_user_agent =
        "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.0.0 Mobile Safari/537.36";
      props.browser_version = "125.0.0.0";
      props.release_channel = "stable";
      props.device = "Android";
      break;
    }
    case "blackberry": {
      props.os = "BlackBerry";
      props.browser = "BlackBerry";
      props.browser_user_agent =
        "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.36 (KHTML, like Gecko) Version/10.3.3 Mobile Safari/537.36";
      props.browser_version = "10.3.3";
      props.release_channel = "stable";
      break;
    }
    case "chrome": {
      applyWebWindows(
        props,
        "Chrome",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        "136.0.0.0",
      );
      break;
    }
    case "chrome_ios": {
      props.os = "iOS";
      props.os_version = "17.4.1";
      props.browser = "Chrome iOS";
      props.browser_user_agent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1";
      props.browser_version = "125.0.6422.80";
      props.release_channel = "stable";
      props.device = "iPhone";
      break;
    }
    case "edge": {
      applyWebWindows(
        props,
        "Edge",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edge/124.0.0.0",
        "124.0.0.0",
      );
      break;
    }
    case "facebook_mobile": {
      props.os = "Android";
      props.os_version = "14";
      props.browser = "Facebook Mobile";
      props.browser_user_agent =
        "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.0;]";
      props.browser_version = "470.0.0.0";
      props.release_channel = "stable";
      break;
    }
    case "firefox": {
      applyWebWindows(
        props,
        "Firefox",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
        "125.0",
      );
      break;
    }
    case "internet_explorer": {
      applyWebWindows(
        props,
        "Internet Explorer",
        "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
        "11.0",
      );
      break;
    }
    case "konqueror": {
      props.os = "Linux";
      props.os_version = "6.5.0";
      props.browser = "Konqueror";
      props.browser_user_agent =
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Konqueror/5.27.0 Safari/537.36";
      props.browser_version = "5.27.0";
      props.release_channel = "stable";
      props.window_manager = "KDE,unknown";
      props.distro = "Generic Linux";
      break;
    }
    case "mobile_safari": {
      props.os = "iOS";
      props.os_version = "17.4.1";
      props.browser = "Mobile Safari";
      props.browser_user_agent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1";
      props.browser_version = "17.4.1";
      props.release_channel = "stable";
      props.device = "iPhone15,2";
      break;
    }
    case "mozilla": {
      applyWebWindows(
        props,
        "Mozilla",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
        "125.0",
      );
      break;
    }
    case "opera": {
      applyWebWindows(
        props,
        "Opera",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0",
        "110.0.0.0",
      );
      break;
    }
    case "opera_mini": {
      props.os = "Android";
      props.os_version = "14";
      props.browser = "Opera Mini";
      props.browser_user_agent =
        "Opera/9.80 (Android; Opera Mini/79.0.2254/191.288; U; en) Presto/2.12.423 Version/12.16";
      props.browser_version = "79.0.2254";
      props.release_channel = "stable";
      break;
    }
    case "safari": {
      props.os = "Mac OS X";
      props.os_version = "14.4.0";
      props.browser = "Safari";
      props.browser_user_agent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";
      props.browser_version = "17.4";
      props.release_channel = "stable";
      props.device = "";
      break;
    }
    default:
      break;
  }

  syncLegacyDollarKeys(props);
}

function patchSuperPropertiesB64(b64: string): string {
  const profile = getProfile();
  if (profile === "native") return b64;

  const props = decodeSuperProperties(b64);
  if (!props) return b64;

  applyProfile(props, profile);
  return encodeSuperProperties(props);
}

function patchPropertiesObject(
  props: Record<string, unknown> | undefined,
): void {
  if (!props) return;
  const profile = getProfile();
  if (profile === "native") return;
  applyProfile(props, profile);
}

function isThenable(v: unknown): v is PromiseLike<unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    "then" in v &&
    typeof (v as { then?: unknown }).then === "function"
  );
}

function applyIdentifyPropertiesMutate(identifyReturn: unknown): void {
  if (identifyReturn === null || identifyReturn === undefined) {
    logger.warn(
      "[clientSpoof] IDENTIFY: null/undefined result — nothing to patch",
    );
    return;
  }
  if (typeof identifyReturn !== "object") {
    logger.warn(
      "[clientSpoof] IDENTIFY: unexpected type",
      typeof identifyReturn,
    );
    return;
  }
  const payload = identifyReturn as { properties?: Record<string, unknown> };
  if (!payload.properties) {
    logger.warn(
      "[clientSpoof] IDENTIFY: no `properties` on object — keys:",
      Object.keys(payload).slice(0, 25),
    );
    return;
  }
  const profile = getProfile();
  if (profile === "native") return;
  applyProfile(payload.properties, profile);
  dbg("Gateway IDENTIFY OK — profile:", profile);
  logger.info(
    "Gateway IDENTIFY: client properties patched (profile",
    profile,
    ")",
  );
}

/**
 * Called from the webpack patch on `handleIdentify()` (fast connect + normal login).
 * Handles both a resolved value and a Promise; otherwise `.properties` is read from the
 * Promise and spoof never applies (e.g. status stays Desktop).
 */
export function afterIdentify(identifyReturn: unknown): void {
  try {
    dbg(
      "afterIdentify called —",
      identifyReturn === null || identifyReturn === undefined
        ? "nullish"
        : typeof identifyReturn,
      isThenable(identifyReturn) ? "(thenable)" : "(sync)",
    );
    if (isThenable(identifyReturn)) {
      void Promise.resolve(identifyReturn).then((resolved) => {
        try {
          applyIdentifyPropertiesMutate(resolved);
        } catch (e) {
          logger.error("afterIdentify (async)", e);
        }
      });
      return;
    }
    applyIdentifyPropertiesMutate(identifyReturn);
  } catch (e) {
    logger.error("afterIdentify", e);
  }
}

function patchFetch(): void {
  const orig = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async function fetchPatched(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const profile = getProfile();
    if (profile === "native") {
      return orig(input, init);
    }

    if (typeof input === "string" || input instanceof URL) {
      const headers = new Headers(init?.headers);
      const key = [...headers.keys()].find((k) => k.toLowerCase() === HEADER);
      if (key) {
        const next = patchSuperPropertiesB64(headers.get(key)!);
        headers.set(key, next);
        const ua = decodeSuperProperties(next)?.browser_user_agent;
        if (typeof ua === "string" && ua.length > 0) {
          headers.set("User-Agent", ua);
        }
        return orig(input, { ...init, headers });
      }
      return orig(input, init);
    }

    if (input instanceof Request) {
      const headers = new Headers(input.headers);
      const key = [...headers.keys()].find((k) => k.toLowerCase() === HEADER);
      if (key) {
        const next = patchSuperPropertiesB64(headers.get(key)!);
        headers.set(key, next);
        const ua = decodeSuperProperties(next)?.browser_user_agent;
        if (typeof ua === "string" && ua.length > 0) {
          headers.set("User-Agent", ua);
        }
        return orig(new Request(input, { headers }), init);
      }
    }

    return orig(input, init);
  };
}

function patchXHR(): void {
  const XHR = globalThis.XMLHttpRequest;
  const orig = XHR.prototype.setRequestHeader;
  XHR.prototype.setRequestHeader = function setRequestHeaderPatched(
    name: string,
    value: string,
  ) {
    if (name.toLowerCase() === HEADER && getProfile() !== "native") {
      const next = patchSuperPropertiesB64(value);
      orig.call(this, name, next);
      const ua = decodeSuperProperties(next)?.browser_user_agent;
      if (typeof ua === "string" && ua.length > 0) {
        try {
          orig.call(this, "User-Agent", ua);
        } catch {
          /* second UA set can fail on some stacks */
        }
      }
      return;
    }
    orig.call(this, name, value);
  };
}

function patchWebSocket(): void {
  const WS = globalThis.WebSocket;
  const orig = WS.prototype.send;
  WS.prototype.send = function sendPatched(
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) {
    if (getProfile() === "native" || typeof data !== "string") {
      return orig.call(this, data);
    }

    try {
      const msg: unknown = JSON.parse(data);
      if (
        msg &&
        typeof msg === "object" &&
        !Array.isArray(msg) &&
        (msg as { op?: unknown }).op === 2 &&
        (msg as { d?: unknown }).d &&
        typeof (msg as { d: unknown }).d === "object"
      ) {
        const d = (msg as { d: Record<string, unknown> }).d;
        patchPropertiesObject(
          d.properties as Record<string, unknown> | undefined,
        );
        return orig.call(this, JSON.stringify(msg));
      }
    } catch {
      /* not JSON */
    }

    return orig.call(this, data);
  };
}

try {
  patchFetch();
  patchXHR();
  patchWebSocket();
  dbg("hooks installed — profile:", getProfile());
  logger.info("Client spoof active — profile:", getProfile());
} catch (e) {
  dbg("hook setup failed", e);
  logger.error("Failed to install hooks", e);
}
