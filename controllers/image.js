import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc";

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${process.env.PAT}`);

const handleApiCall = (req, res) => {
    stub.PostModelOutputs(
        {
            user_app_id: {
                "user_id": process.env.USER_ID,
                "app_id": process.env.APP_ID
            },
            model_id: process.env.MODEL_ID,
            inputs: [
                {
                    data: {
                        image: {
                            url: req.body.input,
                            allow_duplicate_url: true
                        }
                    }
                }
            ]
        },
        metadata,
        (err, response) => {
            if (err) {
                throw new Error(err);
            }

            if (response.status.code !== 10000) {
                throw new Error("Post model outputs failed, status: " + response.status.description);
            }

            const regions = response.outputs[0].data.regions;

            regions.forEach(region => {
                const boundingBox = region.region_info.bounding_box;
                const topRow = boundingBox.top_row.toFixed(3);
                const leftCol = boundingBox.left_col.toFixed(3);
                const bottomRow = boundingBox.bottom_row.toFixed(3);
                const rightCol = boundingBox.right_col.toFixed(3);

                region.data.concepts.forEach(concept => {
                    const name = concept.name;
                    const value = concept.value.toFixed(4);

                    console.log(`${name}: ${value} BBox: ${topRow}, ${leftCol}, ${bottomRow}, ${rightCol}`);

                });
            });
            res.json(response);
        });
}

const handleImage = (req, res, db) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'))
}

export { handleImage, handleApiCall };