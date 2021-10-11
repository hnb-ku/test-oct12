import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.8", (api) => {
  const currentUser = api.getCurrentUser();
  if (!currentUser) return;

  const watermarkOpts = {
    text: "zpfei.ink",
  };

  const positionLeft = 5;
  const positionTop = 5;

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
        const t0 = performance.now();

        let p = new Promise((resolve, reject) => {
          const file = data.files[data.index];

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            img.src = reader.result;
            img.onload = () => {
              const imageWidth = img.width;
              const imageHeight = img.height;

              const fontSize = imageWidth / 20;

              const watermarkAspectRatio =
                downloadedImg.width / downloadedImg.height;
              const watermarkWidth = img.width / 3;
              const watermarkHeight = watermarkWidth / watermarkAspectRatio;

              canvas.width = imageWidth;
              canvas.height = imageHeight;

              ctx.drawImage(img, 0, 0);
              ctx.font = `${fontSize}px Arial`;
              ctx.fillStyle = "red";
              ctx.drawImage(
                downloadedImg,
                positionLeft,
                positionTop,
                watermarkWidth,
                watermarkHeight
              );

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
                const t1 = performance.now();
                console.log(
                  `Call to doSomething took ${t1 - t0} milliseconds.`
                );
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
