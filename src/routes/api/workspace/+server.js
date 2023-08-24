import { json } from '@sveltejs/kit';
import fs from "fs-extra";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    console.log("hack-ed the mainframe")
    const { req } = await request.json();

    let fp = Object.keys(req)[0] + "RocketAnno_project.json"
    console.log(fp)
    fs.writeJson(fp, req, err => {
        if (err) return console.error(err)
        console.log('save successful!')
     })

    return json(req);
}