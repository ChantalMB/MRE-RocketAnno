import fs from 'fs';

/** @type {import('./$types').Actions} */
export const actions = {
    default: async ({ request }) => {
        const data = await request.formData()
        const image = data.get('pic')
        console.log("Image: ")
        console.log(image)

        // console.log("je suis server")
        // console.log(fs.readdirSync("./").map(f => process.cwd() + "/" + f));
        // const formData = await request.formData();
        // const pic = formData.get('pic');
        // console.log("formData:");
        // console.log(...formData);
        return {
            success: true,
            image
        };
    }
};