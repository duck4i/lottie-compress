import { test, expect } from "bun:test";
import { processLottieJson } from "./index";

test("yourFunction returns expected result", async () => {
    const res = await processLottieJson('./test/truck.json', './test/truck_out.json');
    expect(res).toBe(true);
  });