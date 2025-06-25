export function checkCollision(player1Ref, player2Ref) {
  if (!player1Ref.current || !player2Ref.current) return false;

  const rect1 = player1Ref.current.getBoundingClientRect();
  const rect2 = player2Ref.current.getBoundingClientRect();

  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}
