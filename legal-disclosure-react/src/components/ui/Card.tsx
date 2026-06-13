interface CardProps {
    children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            {children}
        </div>
    );
}