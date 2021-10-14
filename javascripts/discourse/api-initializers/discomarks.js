import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.8", (api) => {
  const currentUser = api.getCurrentUser();
  if (!currentUser) return;

  const watermarkOpts = {
    text: "zpfei.ink",
    extentions: settings.composer_image_upload_watermark_extentions.split("|"),
    minWidthToWatermark: settings.composer_image_upload_watermark_threshold,
  };

  const positionLeft = 5;
  const positionTop = 5;

  // watermark image
  const drawWatermarkImage = (image, watermark) => {
    const watermarkAspectRatio = watermark.width / watermark.height;
    const watermarkWidth = img.width / 3;
    const watermarkHeight = watermarkWidth / watermarkAspectRatio;

    ctx.drawImage(
      downloadedImg,
      positionLeft,
      positionTop,
      watermarkWidth,
      watermarkHeight
    );
  };

  // watermark text
  const drawWatermarkText = (image, text) => {
    const fontSize = image.width / 20;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "red";
    ctx.fillText(
      text,
      canvas.width * 0.015,
      canvas.height - canvas.height * 0.02
    );
  };

  const createNewFile = (blob, originalFile) => {
    const newFile = new File([blob], originalFile.name, {
      type: originalFile.type,
    });

    return newFile;
  };

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");


  const downloadedImg = new Image();
  downloadedImg.crossOrigin = "Anonymous";
  downloadedImg.src = settings.default_site_watermark;

  const exifMode = false;


  const myimage = document.createElement("img");

  api.addComposerUploadProcessor(
    { action: "automaticWatermarks" },
    {
      automaticWatermarks: (data, options) => {
        let p = new Promise((resolve, reject) => {
          const t0 = performance.now();

          const file = data.files[data.index];
          const fileExtention = file.type.split("/")[1];

          const reader = new FileReader();

          reader.onload = function (e) {
            myimage.src = e.target.result;

            myimage.onload = () => {
             
              canvas.width = canvas.height = 300;
              ctx.drawImage(myimage, 0, 0);

              const canvasDataURL = canvas.toDataURL(file.type, 1.0);


              var exifObj = piexif.load(e.target.result);
              var exifStr = piexif.dump(exifObj);
              var inserted = piexif.insert(exifStr, canvasDataURL);

              fetch(inserted)
                .then((res) => res.blob())
                .then((blob) => {
                  const newfile = new File([blob], file.name, {
                    type: file.type,
                  });

                  data.files[data.index] = newfile;

                  const t1 = performance.now();
                  console.log(
                    `Call to doSomething took ${t1 - t0} milliseconds.`
                  );

                  resolve(data);
                });
            };
          };
          reader.readAsDataURL(file);
        });

        return p;
      },
    }
  );
});


