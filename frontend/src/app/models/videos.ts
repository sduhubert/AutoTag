export class Video {
    videoid: number = 0;
    userid: number = 0;
    title: string = "";
    filepath: string = "";
    description: string = "";
    thumbnail: string = "Default.jpg";
    tags: { name: string; VideoTag: any }[] = [];
    video_summary: { summary: string; } = { summary: "" };
    validated: boolean = false;
}