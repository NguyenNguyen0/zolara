import type { User } from "@repo/types"
import { useState } from "react";


function App() {
  const [user, setUser] = useState<User>();
  return (
    <>
      <h1 className="text-3xl text-red-400">Hello Admin App</h1>
      <h2>{JSON.stringify(user)}</h2>
      <button onClick={() => {setUser({id: "1", name: "nguyen", email: "n@gmail.com"})}}>Show User</button>
    </>
  )
}

export default App
