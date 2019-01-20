const MergeConflictCheck = require('./lib/MergeConflictCheck');

module.exports = (app) => {
    app.on([
        'pull_request.opened',
        'pull_request.reopened',
        'pull_request.edited',
        'pull_request.synchronize',
    ], async(context) => {
        await new MergeConflictCheck(context);
    });
};
