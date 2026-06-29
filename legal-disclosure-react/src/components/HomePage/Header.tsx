import { Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 shadow-sm">
            <div className="bg-[#2e2c7d] h-12 text-white">

                <div className="w-full h-full flex items-center">

                    <div className="flex items-center px-6">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center bg-white px-5 py-1"
                        >
                            <img
                                src="/image.png"
                                alt="HHV Logo"
                                className="h-8 w-auto"
                            />
                        </button>
                    </div>

                    <div className="w-px h-7 bg-white/40" />

                    <div className="flex-1 px-6 overflow-hidden">
                        <div className="whitespace-nowrap animate-marquee text-lg font-medium text-center">
                            KHÁT VỌNG - KIÊN ĐỊNH - TRI ÂN
                        </div>
                    </div>

                    <div className="w-px h-7 bg-white/40" />

                    <div className="px-6 flex gap-2">

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="
                                flex items-center gap-2
                                text-sm font-semibold
                                px-3 py-1.5
                                rounded-md
                                hover:bg-white/10
                                transition
                            "
                        >
                            <Monitor size={16} />
                            <span>NỘI BỘ</span>
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}