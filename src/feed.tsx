export default function Feed() {
  return (
    <box
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        gap: 1,
      }}
    >
      <ascii-font font="tiny" text="HackTUI" color="#FF653F" marginTop={1.5} />
      <text fg="#FF653F">
        <strong>Welcome!</strong>
      </text>
      <text fg="#666666">Feed coming soon...</text>
    </box>
  );
}
