<?php
//First, set this script to no-cache because it will change.
header("Cache-Control: no-cache ");
//Now, set the MIME type.
header("Content-Type: application/javascript");
//Now, start writing the script.
?>

var apiToken = "<?php //Echo the API token, if any
if(isset($_COOKIE["access_token"])) {
    echo str_replace('"','\\"',$_COOKIE["access_token"]);
} ?>";

var isApiTokenValid = <?php
//Echo if it is valid, or if the cookie was sent.
if(isset($_COOKIE["access_token"])) {
    echo "true";
} else {
    echo "false";
}
?>;

/* Please use the /assets/v2/api-ext.js file for all API activity. */