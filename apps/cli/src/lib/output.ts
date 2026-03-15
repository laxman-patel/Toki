export function output(data: unknown, json: boolean) {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  } else if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log("(empty)");
      return;
    }
    const keys = Object.keys(data[0]);
    console.log(keys.join("\t"));
    for (const row of data) {
      console.log(keys.map((k) => String(row[k] ?? "")).join("\t"));
    }
  } else {
    console.log(data);
  }
}
