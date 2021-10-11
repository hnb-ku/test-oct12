import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";

export default apiInitializer("0.8", (api) => {
  const currentUser = api.getCurrentUser();
  if (!currentUser) return;

  const watermarkOpts = {
    text: "zpfei.ink",
  };

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = document.createElement("img");

  const downloadedImg = new Image();
  downloadedImg.crossOrigin = "Anonymous";

  downloadedImg.src = settings.default_site_watermark;

  api.addComposerUploadProcessor(
    { action: "automaticWatermarks" },
    {
      automaticWatermarks: (data, options) => {
        let p = new Promise((resolve, reject) => {
          const file = data.files[data.index];

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            img.src = reader.result;
            img.onload = () => {
              const fontSize = img.width / 20;
              canvas.width = img.width;
              canvas.height = img.height;

              ctx.drawImage(img, 0, 0);
              ctx.font = `${fontSize}px Arial`;
              ctx.fillStyle = "red";
              ctx.drawImage(downloadedImg, 0, 0);

              ctx.fillText(
                watermarkOpts.text,
                canvas.width * 0.015,
                canvas.height - canvas.height * 0.02
              );
              canvas.toBlob((canvasBlob) => {
                const watermarked = new File([canvasBlob], file.name, {
                  type: file.type,
                });

                data.files[data.index] = watermarked;
                resolve(data);
              });
            };
          };
        });

        return p;
      },
    }
  );
});
