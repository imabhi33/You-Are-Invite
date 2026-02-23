export default function BrandLogo({ className = "" }) {
  return (
    <div className={`flex max-w-[72vw] items-center gap-2 ${className}`.trim()}>
      <img
        src="/logo.png"
        alt="You Are Invited"
        className="h-9 w-9 object-contain sm:h-10 sm:w-10"
      />
      <p className="truncate font-script text-3xl leading-none text-wedding-gold sm:text-4xl">u r invite</p>
    </div>
  );
}
