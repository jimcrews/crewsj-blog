type Blog = {
    id: number,
    title: string,
    tags: Array<string>,
    slug: string,
    cover?: string,
    date: string,
    markdown: string,
    tldr: string
}

export default Blog