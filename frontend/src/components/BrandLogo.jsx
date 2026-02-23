export default function BrandLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <img
        src="/logo.png"
        alt="You Are Invited"
        className="h-10 w-10 object-contain"
      />
      <p className="font-script text-4xl leading-none text-wedding-gold">u r invite</p>
    </div>
  );
}
