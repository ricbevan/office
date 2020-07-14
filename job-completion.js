<!DOCTYPE html>
<html>
    <head>
        <title>GBC Job Completion</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://gbc.uk/css/uikit.min.css" />
    </head>
    <body>

      <div>
        <div class="uk-container uk-container-small uk-margin-medium-top">
          <div uk-height-viewport>
            <div class="uk-flex-center" uk-grid>
              <div class="uk-margin">
                <img src="https://gbc.uk/media/images/icons/favicon-96x96.png" width="38" height="38" class="uk-margin-small-right" />
                <input class="uk-input uk-form-width-medium" type="text" placeholder="Job Number" id="job-number">
                <button class="uk-button uk-button-primary uk-border-rounded" id="complete-job"><span uk-icon="icon: search"></span></button>
              </div>
            </div>
            <div class="uk-child-width-1-1 uk-grid-medium" id ="job-actions" uk-grid></div>
            <div class="uk-flex-center uk-position-bottom" uk-grid>
              <div class="uk-margin">
                <p id="user"></p>
              </div>
            </div>
          </div>

          <div class="uk-position-cover uk-overlay uk-overlay-primary uk-flex uk-flex-center uk-flex-middle uk-text-center" id="loading">
            <div class="uk-child-width-1-1" uk-grid>
              <div id="loading-spinner">
                <span uk-spinner="ratio: 4.5"></span>
              </div>
              <div>
                <p id="loading-message">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script src="https://gbc.uk/js/uikit.min.js"></script>
      <script src="https://gbc.uk/js/uikit-icons.min.js"></script>
      <script src="https://gbc.uk/js/gbc.js"></script>
      <script src="js/gbc-office.js"></script>
      <script src="js/job-completion.js"></script>
    </body>
</html>
