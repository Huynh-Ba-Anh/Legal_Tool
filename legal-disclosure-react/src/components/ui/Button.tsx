import clsx from "clsx";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
}

export default function Button({
    variant = "primary",
    className,
    ...props
}: ButtonProps) {
    const variants = {
        primary:
            "bg-blue-600 hover:bg-blue-700 text-white",

        secondary:
            "border border-gray-300 hover:bg-gray-100",

        danger:
            "bg-red-600 hover:bg-red-700 text-white",
    };

    return (
        <button
            className={clsx(
                "px-4 py-2 rounded-xl transition",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}