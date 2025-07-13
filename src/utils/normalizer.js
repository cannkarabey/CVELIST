// /**
//  * Belirtilen path'teki değeri hep object haline getirir.
//  * Eğer zaten object ise dokunmaz.
//  * Eğer string/number/null ise: { value: <orijinal> } olarak çevirir.
//  */
// export function ensureObject(path, root) {
//   const keys = path.split('.');
//   let obj = root;

//   for (const key of keys.slice(0, -1)) {
//     if (!obj[key]) {
//       obj[key] = {}; // ara path yoksa oluştur
//     }
//     obj = obj[key];
//   }

//   const lastKey = keys[keys.length - 1];
//   if (obj[lastKey] == null) {
//     obj[lastKey] = {};
//   } else if (typeof obj[lastKey] !== 'object') {
//     obj[lastKey] = { value: obj[lastKey] };
//   }
// }


// /**
//  * Belirtilen path'teki tarih string'ini ISO 8601 formatına çevirir.
//  * Eğer tarih geçerli değilse dokunmaz.
//  */
// export function ensureDateISO(path, root) {
//   const keys = path.split('.');
//   let obj = root;

//   for (const key of keys.slice(0, -1)) {
//     if (!obj[key]) return;
//     obj = obj[key];
//   }

//   const lastKey = keys[keys.length - 1];
//   if (obj && typeof obj[lastKey] === 'string') {
//     const date = new Date(obj[lastKey]);
//     if (!isNaN(date)) {
//       obj[lastKey] = date.toISOString();
//     }
//   }
// }
