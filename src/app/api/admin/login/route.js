export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (
      email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
      password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      const headers = new Headers();
      headers.append(
        "Set-Cookie",
        `admin-auth=true; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    }

    return new Response(
      JSON.stringify({ success: false, message: "Invalid credentials" }),
      { status: 401 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  return new Response("Use POST to login", { status: 405 });
}
