export function useS3Upload() {
  const uploadImage = async (file: File, path: string): Promise<string> => {
    const { signedUrl, url_save } = await $fetch<{ signedUrl: string; url_save: string }>(
      "/api/s3/signedurl",
      { params: { path, filename: file.name } },
    );

    await fetch(signedUrl, { method: "PUT", body: file });

    return (url_save?.startsWith("http") ? url_save : signedUrl.split("?")[0]) as string;
  };

  return { uploadImage };
}
