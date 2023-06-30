export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function getBigNumberDivision(a: bigint, b: bigint): number {
  return Number(a) / Number(b);
}

export function getPercentageDifference(a: bigint, b: bigint): number {
  let largerNum, smallerNum, sign = 1;

  if ((a - b) === 0n) {
    return 0;
  }

  if (a == 0n || b == 0n) {
    return 100;
  }

  if (a > b) {
    largerNum = a;
    smallerNum = b;
  } else {
    largerNum = b;
    smallerNum = a;
    sign = -1;
  }

  const difference = getBigNumberDivision(largerNum, smallerNum);

  return ((difference - 1) * 100) * sign;
}