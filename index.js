const core = require('@actions/core');
const github= require('@actions/github');

const ref_tags = "refs/tags/"
const ref_heads = "refs/heads/"

async function run() {
    try {
        const date = new Date();
        const month = date.getMonth() + 1; // Months are zero-indexed, so add 1
        const day = date.getDate();
        const formatted_date = `${date.getFullYear()}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;

        const run_number = github.context.runNumber;

        const ref = github.context.ref;
        core.info(`Got ref: ${ref}`)

        let tag;

        if (ref.startsWith(ref_tags)) {
            // find the version number at the end of the tag, should be in the format "refs/tags/{service}/{version}"
            const parts = ref.split("/");
            tag = parts[3];
        } else if (ref.startsWith(ref_heads)) {
            // substring everything after the length of the starting string
            tag = ref.substring(ref_heads.length)
        } else {
            tag = ref;
        }

        // replace "/" with "-" and lower the tag name to fit Docker's limitations
        const clean_tag = tag.replace(/\//g, '-').toLowerCase();
        const build_number = `${formatted_date}.${run_number}-${clean_tag}`;
        core.info(`Build Number: ${build_number}`)

        core.setOutput('build_number', build_number);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
