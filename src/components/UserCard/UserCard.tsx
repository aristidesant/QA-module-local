// UserCard.tsx
import React from "react";
import { Avatar, Button, Group, Text, Paper } from "@mantine/core";
import styles from "./UserCard.module.css";
import { useNavigate } from "react-router";

function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return {};
  }
}

function getUserInfo() {
  const token = window.localStorage.getItem("accessToken");
  if (!token) return null;
  const decoded = decodeJWT(token);
  return {
    name: decoded.name || decoded.username || "User",
    email: decoded.email || "",
    avatar: decoded.avatar || "",
  };
}

export const UserCard: React.FC = () => {
  const navigate = useNavigate();
  const user = getUserInfo();

  const handleLogout = () => {
    window.localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <Paper className={styles.userCard} shadow="xs" p="md" radius="md">
      <Group>
        <Avatar
          src={user.avatar || undefined}
          alt={user.name}
          radius="xl"
          size="lg"
        >
          {user.name[0]}
        </Avatar>
        <div>
          <Text size="sm" fw={500}>
            {user.name}
          </Text>
          <Text size="xs" color="dimmed">
            {user.email}
          </Text>
        </div>
      </Group>
      <Button
        variant="light"
        color="red"
        fullWidth
        mt="md"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Paper>
  );
};
