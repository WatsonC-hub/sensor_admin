export function HighlightedText({text, highlight}: {text: string; highlight: string}) {
  if (!highlight) return <>{text}</>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} style={{backgroundColor: 'yellow'}}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
