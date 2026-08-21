import { AppRouter } from "@/routes/AppRouter";
import { ThemeProvider } from "@/context/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

