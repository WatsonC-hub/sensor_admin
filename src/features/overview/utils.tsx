export function HighlightedText({text, highlight}: {text: string; highlight: string}) {
  if (!highlight) return <>{text}</>;
  if (!text) return <></>;

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escaped = escapeRegExp(highlight);

  const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
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

export const MatchedText = ({textArray, regex}: {textArray: string[]; regex: RegExp}) => {
  return (
    <>
      {textArray.map((text, i) => {
        const match = text.match(regex);
        return match ? (
          <span key={i} style={{backgroundColor: 'yellow'}}>
            {match[0]}
          </span>
        ) : (
          text
        );
      })}
    </>
  );
};
