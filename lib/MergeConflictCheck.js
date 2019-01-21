const BaseCheck = require('./BaseCheck');

/**
 * Handle the PR title check
 */
class MergeConflictCheck extends BaseCheck {

    /**
     * Construct the check
     *
     * @inheritDoc
     */
    constructor(context) {
        super(context, {
            name: 'Merge Conflicts',
            failureMessage: 'Merge conflicts detected',
        });
    }

    /**
     * Get the mergeable state of the PR from github
     *
     * @returns {String}
     */
    async getMergeableState() {
        const pr = this.context.payload.pull_request;

        return this.context.github.pullRequests.get({
            owner: pr.base.repo.owner.login,
            repo: pr.base.repo.name,
            number: pr.number,
        }).then(({ data }) => {
            // We'll assume that mergeable is an accurate boolean
            // status for detecting merge conflicts
            if (data.mergeable === true) {
                return true;
            }
            // If any of the following states are returned, we
            // know that the merge check has completed
            if (['dirty', 'clean', 'unstable'].includes(data.mergeable_state)) {
                return data.mergeable_state;
            }

            // Otherwise we'll poll again
            return this.getMergeableState();
        });
    }

    /**
     * Return the state of the check
     *
     * @returns {String|Boolean}
     */
    async checkIsValid() {
        const state = await this.getMergeableState();

        return state !== 'dirty';
    }

    /**
     * Comment on the PR after the status has been set
     *
     * @inheritDoc
     */
    async afterStatus({ data }) {
        if (data.state !== 'failure') {
            return;
        }

        const { user } = this.context.payload.pull_request;

        const comment = this.context.issue({
            body: `
Uh oh!

Looks like this PR has some conflicts with the base branch, @${ user.login }.

Please bring your branch up to date as soon as you can.
            `,
        });

        await this.context.github.issues.createComment(comment);
    }
}

module.exports = MergeConflictCheck;
