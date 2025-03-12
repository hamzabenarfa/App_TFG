import { setSession } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

class AuthService {
  async login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response)

    setSession(data.access_token);
   return data
  }

  async register(credentials) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });


    return handleResponse(response);
  }
}

const authService = new AuthService();
export default authService;
