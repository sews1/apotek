export default function ApplicationLogo({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#2563eb" />
            <text x="50%" y="55%" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="sans-serif">
                HF
            </text>
        </svg>
    );
}
