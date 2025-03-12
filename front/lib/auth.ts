"use server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export const setSession = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "accessToken",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });
};

export const isAuthenticated = async (): Promise<boolean> => {
  const accessToken = await getSession();
  return !!accessToken;
};

export const getSession = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
};
export const getUserId = async () => {
  const accessToken = await getSession();
  if (!accessToken) return null;

  try {
    const decodedToken = jwtDecode(accessToken);
    return decodedToken.idUser;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
export const getUserRole = async () => {
  const accessToken = await getSession();
  if (!accessToken) return null;

  try {
    const decodedToken = jwtDecode(accessToken);
    return decodedToken.role;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
export const getUserData = async () => {
  const accessToken = await getSession();
  if (!accessToken) return null;

  try {
    return jwtDecode(accessToken);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const removeTokenFromCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
};

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
};
