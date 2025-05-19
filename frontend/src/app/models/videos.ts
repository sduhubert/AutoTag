export class Video {
    videoid: number = 0;
    userid: number = 0; 
    title: string = "";
    filepath: string = "";
    description: string = "";
    // duration: {
    //     minutes: number = 0;
    //     seconds: number = 0;
    // };
    thumbnail: string = "Default.jpg";
    tags: { name: string; VideoTag: any }[] = [];
    video_summary: { summary: string;} = { summary: ""};
}
