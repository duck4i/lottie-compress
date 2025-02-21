# Lottie Compress

Optimize Lottie JSON files to significantly reduce the file size.

## Install

```bash
npm install -D @duck4i/lottie-compress
```

##  Usage

```js
import { processLottieJson} from "lottie-compress";

const res = await processLottieJson('./truck.json', './truck_out.json');
//      ^ true

```