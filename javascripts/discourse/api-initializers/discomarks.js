import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.8", (api) => {
  const currentUser = api.getCurrentUser();
  if (!currentUser) return;

  api.addComposerUploadProcessor(
    { action: "automaticWatermarks" },
    {
      automaticWatermarks: (data, options) => {
        let p = new Promise((resolve, reject) => {
          const file = data.files[data.index];
       
          const reader = new FileReader();

          reader.onload = function (e) {
            var exifObj = piexif.load(e.target.result);
            var exifStr = piexif.dump(exifObj);
            var inserted = piexif.insert(exifStr, e.target.result);

            fetch(inserted)
              .then((res) => res.blob())
              .then((blob) => {
                const newfile = new File([blob], file.name, {
                  type: file.type,
                });

                console.log(file);
                console.log(newfile);

                data.files[data.index] = newfile;

                resolve(data);
              });
          };
          reader.readAsDataURL(file);

        
        });

        return p;
      },
    }
  );
});


