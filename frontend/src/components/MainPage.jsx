import React, { useState, useEffect } from "react";
import BookList from "./BookList";
import MyBooks from "./MyBooks";
import BookForm from "./BookForm";
import LogoutButton from "./Profile";

function MainPage() {
  const [view, setView] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const tabs = [
    { key: "all", label: "Libreria completa" },
    { key: "mine", label: "Mi libreria" },
    { key: "form", label: "Nuevo escrito" },
    { key: "Profile", label: "Mi perfil" }
  ];

  return (
    
    <div className="min-h-screen bg-[url('/background.jpeg')] bg-cover bg-center text-gray-900 backdrop-blur-sm p-6">
      <div className="max-w-5xl mx-auto bg-white/90 rounded-xl shadow-lg p-8 max-h-[85vh] overflow-y-auto scrollbar-hide">

        <div className="flex flex-col items-center mb-6">
          <img
            src="/openbook.png"
            alt="Ícono libro"
            className="h-10 w-10 mb-2"
          />
          <h1 className="text-3xl font-serif font-bold text-center">
            Bienvenido a Ourlumina
          </h1>
          
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-2 rounded-full transition-all font-medium
                ${
                  view === key
                    ? "bg-amber-700 text-white shadow-md"
                    : "bg-white border border-amber-700 text-amber-700 hover:bg-amber-100"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === "all" && <BookList />}
        {view === "mine" && <MyBooks />}
        {view === "form" && <BookForm />}
        {view === "Profile" && <LogoutButton redirectTo="/login" />}
      </div>
    </div>
  );
}

export default MainPage;
