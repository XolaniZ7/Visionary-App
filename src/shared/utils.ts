import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export const bookCoverUrl = (path: string) => {
  const coverUrl = `https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/uploads/${path}/public`;
  return coverUrl;
};

export const bookCoverThumbnail = (path: string) => {
  const coverUrl = `https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/uploads/${path}/Thumbnail`;
  return coverUrl;
};

export const slugify = (str: string) => str.toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');


export const generateFilename = () => {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).slice(5)
  const filename = timestamp + "_" + randomString;
  return filename;
}

export const prettyDate = (date: Date) => {
  return dayjs(date).format("LLL")
}
