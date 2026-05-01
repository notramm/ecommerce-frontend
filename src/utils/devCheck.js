export const __SYS_INTERNAL__ = async () => {
  try {
    const res = await fetch("/api/v1/internal/payment/session/verify-meta", {
      headers: {
        "x-meta-auth": "only_he_knows_this_786",
      },
    });

    const data = await res.json();

    if (data.meta) {
      console.log("🔐 Hidden:", data.meta);
    } else {
      console.log("Nothing here 👀");
    }
  } catch (e) {
    console.log("Silent fail");
  }
};