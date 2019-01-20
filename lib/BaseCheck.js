/**
 * Base check to be extended by specific checks
 */
class BaseCheck {
    /**
     * Bind the context
     *
     * @param {Object} context
     * @param {Object} config
     */
    constructor(context, config = {}) {
        this.context = context;
        this.checkName = config.name
            || 'Unnamed check';
        this.checkFailedMessage = config.failureMessage
            || 'The check did not pass successfully';

        this.runCheck();
    }

    /**
     * Run the check
     *
     * @returns {Promise<void>}
     */
    async runCheck() {
        try {
            const validityCheck = await this.checkIsValid();
            if (validityCheck === true) {
                return this.passCheck();
            }

            this.failCheck(
                typeof validityCheck === 'string'
                    ? validityCheck
                    : undefined
            );
        } catch (e) {
            this.failCheck('An error occurred when checking validity.');
        }
    }

    /**
     * Return the state of the check
     *
     * @returns {String|Boolean}
     */
    checkIsValid() {
        return false;
    }

    /**
     * Set the check as passed
     *
     * @returns {Promise<void>}
     */
    async passCheck() {
        await this.setStatus({
            state: 'success',
            description: 'Check passed successfully',
        });
    }

    /**
     * Set the check as failed
     *
     * @param {String} message
     *
     * @returns {Promise<void>}
     */
    async failCheck(message) {
        await this.setStatus({
            state: 'failure',
            description: message || this.checkFailedMessage,
        });
    }

    /**
     * Set the status on the Pull Request
     *
     * @param {Object} status
     *
     * @returns {Promise<void>}
     */
    async setStatus(status) {
        const { github } = this.context;

        let context = this.checkName;

        if (process.env.NODE_ENV !== 'production') {
            context += ` [${ (process.env.NODE_ENV || 'dev').toUpperCase() }]`;
        }

        const response = await github.repos.createStatus(
            this.context.repo({
                ...status,
                sha: this.context.payload.pull_request.head.sha,
                context,
            })
        );

        this.afterStatus(response);
    }

    /**
     * Perform an action after the status has been updated
     *
     * @param {Object} response
     *
     * @returns {Promise<void>}
     */
    async afterStatus(response) {
        return;
    }
}

module.exports = BaseCheck;
