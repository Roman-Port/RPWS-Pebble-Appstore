<?php
	//Anti cache headers
	header("Cache-Control: no-cache");
	?>
<!DOCTYPE html> 
<html lang="en" >
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="pragma" content="no-cache" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<!-- Include loader here -->
		<style>

			.loader_bar {
			
			background-color:#ff4700;
			z-index:2000000;
			position:fixed;
			height: 8px;
			top:0;
			left:0;
			right:50%;
			animation: loader 2.5s infinite;
			
			}

			@keyframes loader {
				from {
					left:0;
					right:100%;
				}
				50% {
					left:0;
					right:0;
				}
				to {
					left:100%;
					right:0;
				}
			}
		</style>

		<?php $updateCache = "?cache=36"; $native = false; if(isset($_GET["native"])){if($_GET["native"]=="true"){$native = true;}}?>
		
		<link rel="stylesheet" href="/assets/v3/viewmanager.css<?php echo $updateCache;?>">
		<link rel="stylesheet" href="/assets/v2/style_frontpage_mobile.css<?php echo $updateCache;?>">
		<?php if(!$native){echo '<link rel="stylesheet" href="/assets/v2/style_frontpage_desktop.css'.$updateCache.'">';}?>
		<link rel="stylesheet" href="/assets/v2/shared.css<?php echo $updateCache;?>">
		<link rel="stylesheet" href="/assets/v3/views/list/view.css<?php echo $updateCache;?>">

		<link href="https://fonts.googleapis.com/css?family=Roboto:300,400" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=PT+Sans" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=IBM+Plex+Mono" rel="stylesheet">
		<link rel="apple-touch-icon" sizes="180x180" href="/resources/fav/apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="/resources/fav/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="/resources/fav/favicon-16x16.png">
		<link rel="manifest" href="/resources/fav/site.webmanifest">
		<link rel="mask-icon" href="/resources/fav/safari-pinned-tab.svg" color="#5bbad5">
		<link rel="shortcut icon" href="/resources/fav/favicon.ico">
		<meta name="msapplication-TileColor" content="#da532c">
		<meta name="msapplication-config" content="/resources/fav/browserconfig.xml">
		<meta name="theme-color" content="#ffffff">
		<!-- End icon crap --> 
		<!-- Load Flickity CSS --> 
		<link rel="stylesheet" href="https://romanport.com/api/PebbleRipper/assets/flickity.css">
		<title>RPWS Appstore</title>
		<!-- Use PHP to autofill app details if needed. -->
		<meta property="og:url" content="https://apps.get-rpws.com/"/>
        <?php
        // Very old user data script as a dependency 
		include "/var/www/pebbleapis/internal_phps/userData.php";
		include "/var/www/pebbleapis/internal_phps/appstore_v2_api_new.php";

			//Check if the user is even requesting an app.
			$app = $_SERVER[REQUEST_URI];
			$i = strrpos($app,"/app/");
			if($i !== false) {
				$app = substr($app,$i+4);
				$app = trim($app,"/");
				if(strlen($app)>1) {
					//Use Appstorev2 to get the data for the embed.
	
					$data = AppstoreV2Api::GetAppByIdAnyCompatible($app);
	
	
					if($data!=null) {
						//App exists. Extract data and write.
	
						$app = $data["id"];
	
						//Trim description
						if(strlen($data["description"])>100) {
							$data["description"] = substr($data["description"],0,100)."...";
						}
	
						//Get screenshot
						$screenshot = $data["screenshot_images"][0];
						$keys = array_keys($screenshot);
						$screenshot=$screenshot[$keys[0]];
						
						echo '<meta property="og:site_name" content="RPWS Appstore - The New Pebble Appstore"/>';
						echo '<meta property="og:title" content="'.addslashes($data["title"]." by ".$data["author"]).'"/>';
						echo '<meta property="og:description" content="'.addslashes($data["description"]).'"/>';
						echo '<meta property="og:image" content="'.addslashes($screenshot).'" />';
					} else {
						//Couldn't find.
						echo '<meta property="og:title" content="App not found!" />';
					}
				}
			} else {
				echo '<meta property="og:title" content="RPWS Appstore - The New Pebble Appstore"/>';
				echo '<meta property="og:description" content="The RPWS appstore is the new Pebble appstore, powered by the RPWS services. RPWS offers replacement services for the Pebble smartwatch, like Timeline, locker, appstore and more."/>';
			}
			
		?>
	</head>
	<body style="margin:0;">

		<div class="vloader_loader_screen vloader_loader_screen_active"><!-- Transition hider --><div class="loader_bar" id="loader_bar"></div></div>
		<div class="toast_message"><div class="toast_message_inner"></div></div>
		<div class="toast_message" style="position: fixed;top:0;z-index: 999;width: 100%;"><div class="toast_message_inner"></div></div>

		<?php $versionNo = "v3.02 (9/24/18)"; ?>

		<!-- Click catcher -->
		<div class="clickCatcher clickCatcherDisable" id="clickCatcher" onclick="viewman.clickCatcherCallback(); viewman.clickCatcherCallback=null; viewman.unsetClickCatcher();" style="z-index: 101;"></div>

		<!-- Begin views -->

		<div id="view_list" class="viewman_view">
			<div class="materialLikeFloatingBtn fakeSortBtn" id="fakeSortBtn"> </div>
			<div class="materialLikeFloatingBtn pointer" onclick="vsort.toggle();" id="sortBtn"> <img src="/resources/filter_list.svg" alt="Filter" style="height:100%;"> </div>
			<!-- Desktop header -->
			<div class="main_container desktopOnly" style="background-color:unset; margin-bottom:0px;">
				<div class="watchappWatchfaceTitle">
					RPWS Appstore
				</div>
				<div class="watchappWatchfaceSelectorArea">
					<div onclick="vlist.switchType('watchapp');" class="newSortCategoryButton newSortCategorySortButton newSortCategoryButtonToggle1 pointer txt watchappsFacesSelectorButton" id="typeselect_watchapp">
						<div class="newSortCategoryButtonInner txt">Watchapps</div>
					</div>
					<div onclick="vlist.switchType('watchface');" class="newSortCategoryButton newSortCategorySortButton newSortCategoryButtonToggle1 pointer txt watchappsFacesSelectorButton" id="typeselect_watchface">
						<div class="newSortCategoryButtonInner txt">Watchfaces</div>
					</div>
				</div>
			</div>
			<!-- End Desktop header -->
			<div class="main_container drop_shadow" id="appsList">
				<!-- Nav buttons --> 
				<div class="main_footer">
					<div class="pebble_classic_button_sbs_container_nestedParent">
						<div class="pebble_classic_button_sbs_container noselect">
							<div class="pebble_classic_button pebble_classic_button_sbs classic_button_disabled backPage" id="prev_btn_1" onclick="vlist.switchPage(-1);"> <span id="text_previous_page">Previous Page</span> </div>
							<div class="pebble_classic_button pebble_classic_button_sbs classic_button_disabled nextPage" id="next_btn_1" onclick="vlist.switchPage(1);"> <span id="text_next_page">Next Page</span> </div>
						</div>
					</div>
					<div class="mobile_sort_contaner"> </div>
				</div>
				<!-- End nav buttons --> <!-- App list area --> 
				<div class="app_list" id="app_list">
					<ul id="app_list_ul" class="appsList appListUl" style="height: auto; min-height: 100vh;">
						
					</ul>
				</div>
				<!-- End app list area --> <!-- Bottom nav buttons --> 
				<div class="main_footer" id="main_footer">
					<div class="pebble_classic_button_sbs_container_nestedParent">
						<div class="pebble_classic_button_sbs_container noselect" id="bottomNavButtons">
							<div class="pebble_classic_button pebble_classic_button_sbs classic_button_disabled backPage" id="prev_btn_2" onclick="vlist.switchPage(-1);"> <span id="2text_previous_page">Previous Page</span> </div>
							<div class="pebble_classic_button pebble_classic_button_sbs classic_button_disabled nextPage" id="next_btn_2" onclick="vlist.switchPage(1);"> <span id="2text_next_page">Next Page</span> </div>
						</div>
					</div>
					<div class="mobile_sort_contaner"> </div>
				</div>
				<!-- End nav buttons --> 
				

			</div>
		</div>












		<!-- Item view -->
		<div id="item_view" class="viewman_view">
			<!-- Content -->
			<div id="appdata-content" class="modal" >
				<div class="modal-content drop_shadow" >
					<div class="DownloadOptionsModalContainerBar">
						<div class="DownloadOptionsModalContainer">
							<div class="DownloadOptionsModal">
								<!-- Buttons -->
								<div class="DownloadOptionsModalContentButtonArea" id="DownloadModalContent">
									<div class="DownloadOptionsModalClassButton" onclick="vitem.runtime.downloadOgPbw();">Download Original</div>
									<div class="DownloadOptionsModalClassButton" onclick="vitem.runtime.downloadOptionsButton_DownloadPatched();">Download Timeline Patched</div>
								</div>
								<!-- Get rpws ad -->
								<div class="DownloadOptionsModalContentCurve"></div>
								<div class="DownloadOptionsModalContentRpwsBlue"></div>
								<div class="DownloadOptionsModalContentRpwsAd">
									<div class="DownloadOptionsModalContentRpwsAdText">Get RPWS to add this app directly to your watch</div>
									<div class="DownloadOptionsModalContentRpwsAdTextSmall" style="margin-bottom:15px;">(with timeline, locker, and more)</div>
									<div class="DownloadOptionsModalClassButton DownloadOptionsModalClassButtonRpws" onclick="shared.openExternal('https://get-rpws.com/');">Get RPWS</div>
									<div class="DownloadOptionsModalClassButton DownloadOptionsModalClassButtonRpws" onclick="vitem.runtime.downloadOptionsButton_SignIntoRpws();">Sign In</div>
								</div>
							</div>
						</div>
					</div>
					<div class="app_fullcard_header" >
						<div id="app_icon_card" class="noselect" style="float:left; height:30px; padding:15px; padding-right:3px;">
							<!-- Icon goes here --> 
						</div>
						<div class="app_fullcard_header_text" style="float:left; ">
							<div style="height:50%; overflow:hidden;">
								<div id="title_card" class="txt"> App_Title </div>
							</div>
							<div style="height:50%" id="author_card" class="app_fullcard_header_text_suffix txt"> Author </div>
						</div>
						
						<div class="app_fullcard_header_getbutton noselect pointer" id="getButtonInside" onclick="vitem.runtime.getButtonPressed();">ADD </div>
					</div>
					<div class="app_fullcard_banner noselect" id="banner_card_container" style="    padding-top: 44.4%;">
						<div style="position:  absolute;top: 0;	left: 0;bottom: 0;right: 0;">
							<!-- Banner image goes here.-->
							<div class="banner_loader gray_loader_frame" id="banner_loader">
								<div class="gray_loader">
								</div>
								<!--<div class="banner_loader_icon_container gray_loader_frame">
									</div>-->
							</div>
							<div id="banner_card"></div>
						</div>
					</div>
					<div class="app_fullcard_quickTip">
						<!-- This shows various bits of info like companion apps, and likes. --> 
						<ul>
							<li>
								<div class="app_fullcard_quickTip_content" style="float:left;">
									<!--Content--> 
								</div>
								<div class="app_fullcard_quickTip_divider" style="float:right;"> </div>
							</li>
							<li onclick="vitem.runtime.likeButtonPressed();" style="cursor:pointer;" class="noselect">
								<!--Content (heart container)--> 
								<div class="text_center_hack">
									<span class="app_fullcard_heart_container">
										<!-- Heart data goes here -->
										<div class="text_center_hack">
											<span class="app_fullcard_heart">
												<img src="/resources/favorite.svg" height="15" alt="Favorite" style="vertical-align:top" id="heart_icon"> <span style="margin-left:2px;" id="hearts_amount"> ... </span>
												
											</span>
										</div>
									</span>
								</div>
							</li>
							<li>
								<div class="app_fullcard_quickTip_content" style="float:right;">
									<!--Content--> 
								</div>
								<div class="app_fullcard_quickTip_divider" style="float:left;"> </div>
							</li>
						</ul>
					</div>
				</div>
				<div class="getRpwsAdContainer">
					<!-- This shows an ad for RPWS if the user tries to like an app without being singed in. -->
					<div class="getRpwsCenter">
						<div class="DownloadOptionsModal getRpwsAd">
							<div class="DownloadOptionsModalContentCurve"></div>
							<div class="DownloadOptionsModalContentRpwsBlue"></div>
							<div class="DownloadOptionsModalContentRpwsAd">
								<div class="DownloadOptionsModalContentRpwsAdText">Get RPWS to use that feature</div>
								<div class="DownloadOptionsModalContentRpwsAdTextSmall">(with timeline, locker, and more)</div>
								<div class="DownloadOptionsModalClassButton DownloadOptionsModalClassButtonRpws" onclick="shared.openExternal('https://get-rpws.com/');">Get RPWS</div>
								<div class="DownloadOptionsModalClassButton DownloadOptionsModalClassButtonRpws" onclick="vitem.runtime.downloadOptionsButton_SignIntoRpws();">Sign In</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="app_fullcard_screenshots noselect" >
				<div class="app_fullcard_screenshots_previewFrame"> </div>
				<div class="main-carousel" id="screenshots_card"> </div>
			</div>
			<div class="modal">
				<div class="modal-content drop_shadow" style="margin-bottom: 20px;">
					<div class="app_fullcard_description_header" id="text_app_description"> Description </div>
					<div class="app_fullcard_description" id="description_card"> </div>
					<div class="app_fullcard_description_details app_fullcard_description">
						<div class="app_fullcard_meta_prefix"> <span id="text_app_author">Author</span><br> <span id="text_app_cat">Category</span> <br> <span id="text_app_modDate">Last Updated</span> <br> <span id="text_app_modVersion">Version</span></div>
						<div style="float:left; margin-right:10px;" id="meta"> Blah <br> Blah </div>
					</div>
					<div class="app_fullcard_description noselect" style="margin:0px; padding:0px; width:100%; min-height:0px; margin-top:5px;">
						<!--Buttons at the bottom --> 
						<ul>
							<li class="app_fullcard_footerButton" style="display:none;" id="download_android" onclick="vitem.runtime.openCompanion('android');">
								<div class="appDetails_MenuItem_Text"> Android Companion App </div>
								<div class="appDetails_MenuItem_Next appDetails_MenuItem_Text"> <img src="/resources/next_arrow.svg" style="height:100%;" alt="Arrow"> </div>
							</li>
							<li class="app_fullcard_footerButton" style="display:none;" id="download_ios" onclick="vitem.runtime.openCompanion('ios');">
								<div class="appDetails_MenuItem_Text" > iOS Companion App </div>
								<div class="appDetails_MenuItem_Next appDetails_MenuItem_Text"> <img src="/resources/next_arrow.svg" style="height:100%;" alt="Arrow"> </div>
							</li>
							<li class="app_fullcard_footerButton" id="websiteBtn" style="display:none;" onclick="vitem.runtime.openLink('website');">
								<div class="appDetails_MenuItem_Text" > App Website </div>
								<div class="appDetails_MenuItem_Next appDetails_MenuItem_Text"> <img src="/resources/next_arrow.svg" style="height:100%;" alt="Arrow"> </div>
							</li>
							<!--<li class="app_fullcard_footerButton" id="moreFromDevBtn" style="display:none;" onclick="MoreFromDevBtn();">
								<div class="appDetails_MenuItem_Text" > More from the Developer </div>
								<div class="appDetails_MenuItem_Next appDetails_MenuItem_Text"> <img src="/resources/next_arrow.svg" style="height:100%;" alt="Arrow"> </div>
							</li>-->
							<li class="app_fullcard_footerButton" id="sourceBtn" style="display:none;" onclick="vitem.runtime.openLink('source');">
								<div class="appDetails_MenuItem_Text" > App Source </div>
								<div class="appDetails_MenuItem_Next appDetails_MenuItem_Text"> <img src="/resources/next_arrow.svg" style="height:100%;" alt="Arrow"> </div>
							</li>
							<li class="app_fullcard_footerButton" id="sourceBtn" onclick="vitem.runtime.changelog();">
								<div class="appDetails_MenuItem_Text" > View Changelog </div>
								<div class="appDetails_MenuItem_Next appDetails_MenuItem_Text"> <img src="/resources/next_arrow.svg" style="height:100%;" alt="Arrow"> </div>
							</li>
							<li class="app_fullcard_footerButton" id="pbwDownloadBtn" onclick="vitem.runtime.downloadPbw();">
								<div class="appDetails_MenuItem_Text" id="downloadPbwFileBtn"> Download PBW File </div>
								<div class="appDetails_MenuItem_Text appDetails_MenuItem_Next"> <img src="/resources/next_arrow.svg" style="height:100%;" alt="Arrow"> </div>
							</li>
							<li class="app_fullcard_footerButton" onclick="vitem.runtime.submitTakedown();">
								<div class="appDetails_MenuItem_Text" > Send Takedown Request </div>
								<div class="appDetails_MenuItem_Next appDetails_MenuItem_Text"> <img src="/resources/next_arrow.svg" style="height:100%;" alt="Arrow"> </div>
							</li>
						</ul>
					</div>
					<!--<div class="app_fullcard_footer" id="footer_card"> </div>--> 
				</div>
			</div>
		</div>




		<!-- Sort view -->
		<div class="newSortOuterContainer noselect" id="newSortOuterContainer">
            <div class="newSortBottomFooterText newSortInnerContainer" id="aboutPane" style="position: absolute; bottom: 35px; z-index: 100;">RPWS Appstore by RomanPort - <a href="javascript:vsort.runtime.showLegalInfo();" style="color:unset;">Changelog</a> - <?php echo $versionNo; ?></div>  
			<div class="newSortInnerContainer" id="newSortInnerContainer" style="transition: all 100ms ease 0s;">
				<div class="horizSepContainer">
					<div></div>
					<span>Search Query</span>
					<div></div>
				</div>
				<div class="newInputCategoryContainer">
					<div class="newSortCategoryButton newSortCategoryInputButton newSortCategoryButtonToggle3">
						<div class="newSortCategoryButtonInner"><input type="text" id="searchQueryMobileV3" class="newSortCategoryInputButtonText" oninput="vsort.runtime.QueryModified(this);" name="Query" placeholder="Search Query"></div>
					</div>
				</div>
				<div id="sortV3CategorySelect" style="">
					<div class="horizSepContainer">
						<div></div>
						<span>Category</span>
						<div></div>
					</div>
					<div class="newSortCategoryContainer">
						<div class="newSortCategoryButton newSortCategoryButtonToggle0 pointer txt" id="searchUiV3_5261a8fb3b773043d500000c" onclick="vsort.runtime.NewSortButtonPressed(this,0,'5261a8fb3b773043d500000c');" style="color:#3db9e6;">
							<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/cat_daily.svg" style="height:100%;" alt="Daily"> Daily </div>
						</div>
						<div class="newSortCategoryButton newSortCategoryButtonToggle0 pointer txt" id="searchUiV3_5261a8fb3b773043d500000f" onclick="vsort.runtime.NewSortButtonPressed(this,0,'5261a8fb3b773043d500000f');" style="color:#fdbf37;">
							<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/cat_tau.svg" style="height:100%;" alt="Tools And Utilities"> Tools &amp; Utilities </div>
						</div>
						<div class="newSortCategoryButton newSortCategoryButtonToggle0 pointer txt" id="searchUiV3_5261a8fb3b773043d5000001" onclick="vsort.runtime.NewSortButtonPressed(this,0,'5261a8fb3b773043d5000001');" style="color:#FF9000;">
							<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/cat_notifications.svg" style="height:100%;" alt="Notifications"> Notifications </div>
						</div>
						<div class="newSortCategoryButton newSortCategoryButtonToggle0 pointer txt" id="searchUiV3_5261a8fb3b773043d5000008" onclick="vsort.runtime.NewSortButtonPressed(this,0,'5261a8fb3b773043d5000008');" style="color:#fc4b4b;">
							<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/cat_remotes.svg" style="height:100%;" alt="Remotes"> Remotes </div>
						</div>
						<div class="newSortCategoryButton newSortCategoryButtonToggle0 pointer txt" id="searchUiV3_5261a8fb3b773043d5000004" onclick="vsort.runtime.NewSortButtonPressed(this,0,'5261a8fb3b773043d5000004');" style="color:#98D500;">
							<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/cat_health.svg" style="height:100%;" alt="Health And Fitness"> Heath &amp; Fitness </div>
						</div>
						<div class="newSortCategoryButton newSortCategoryButtonToggle0 pointer txt" id="searchUiV3_5261a8fb3b773043d5000012" onclick="vsort.runtime.NewSortButtonPressed(this,0,'5261a8fb3b773043d5000012');" style="color:#b57ad3;">
							<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/cat_games.svg" style="height:100%;" alt="Games"> Games </div>
						</div>
					</div>
				</div>
				<div class="horizSepContainer">
					<div></div>
					<span>Sort</span>
					<div></div>
				</div>
				<div class="newSortSortContainer">
					<div class="newSortCategoryButton newSortCategorySortButton newSortCategoryButtonToggle1 pointer txt" id="searchUiV3_DATE" onclick="vsort.runtime.NewSortButtonPressed(this,1,'DATE');">
						<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/sort_date.svg" style="height:100%;" alt="Date"> Date </div>
					</div>
					<div class="newSortCategoryButton newSortCategorySortButton newSortCategoryButtonToggle1 pointer txt newSortCategoryButtonSelected" id="searchUiV3_POPULAR" onclick="vsort.runtime.NewSortButtonPressed(this,1,'POPULAR');">
						<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/sort_popular.svg" style="height:100%;" alt="Popularity"> Popularity </div>
					</div>
					<div class="newSortCategoryButton newSortCategorySortButton newSortCategoryButtonToggle1 pointer txt" id="searchUiV3_NAME" onclick="vsort.runtime.NewSortButtonPressed(this,1,'NAME');">
						<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/sort_name.svg" style="height:100%;" alt="Name"> Name </div>
					</div>
					<div class="newSortCategoryButton newSortCategorySortButton newSortCategoryButtonToggle1 pointer txt" id="searchUiV3_CATEGORY" onclick="vsort.runtime.NewSortButtonPressed(this,1,'RANDOM');">
						<div class="newSortCategoryButtonInner txt"><img src="/resources/v2/sort_shuffle.svg" style="height:100%;" alt="Shuffle"> Shuffle </div>
					</div>
				</div>
				<div class="newSortSortContainer">
					<div class="horizSepContainer">
						<div></div>
						<span>Page</span>
						<div></div>
					</div>
					<div class="sortV3PageSelectSlider"><input type="range" min="1" max="185" value="0" class="slider" oninput="vsort.runtime.sliderChanged();" id="sortV3PageSlider"></div>
					<div class="sortV3PageSelectText" id="sortV3PageSliderText"><div style="display:inline;" id="sortV3Current"></div> / <span id="sortV3Max"></span></div>
				</div>
			</div>
		</div>
		<div class="newSortBottom" id="newSortBottom">
			<div class="pebble_classic_button pointer" style="margin:auto; width:300px;" id="searchSortBtn" onclick="vsort.runtime.confirm();"> Search </div>
			
		</div>
		<div class="newSortBg" id="newSortBg"></div>
		<div style="display:none;" id="newSortNull"></div>



		<!-- Custom view -->
		<div class="newSortOuterContainer noselect" id="newSortOuterContainerCustom" style="z-index:900012;">
			<div class="newSortInnerContainer" id="newSortInnerContainerCustom" style="transition: all 100ms ease 0s;">
				
			</div>
		</div>
		<div class="newSortBottom" id="newSortBottomCustom" style="z-index:900013;">
			<div class="pebble_classic_button pointer" style="margin:auto; width:300px;" onclick="vcustom.done();" id="customViewOkay"> Okay </div>
		</div>
		<div class="newSortBg" id="newSortBgCustom" style="z-index:900011;"></div>
		<div style="display:none;" id="newSortNullCustom"></div>
		

		<!-- Script init -->
		<script type="text/javascript" src="/assets/v3/native.js<?php echo $updateCache;?>"></script>
		<script type="text/javascript" src="/assets/v3/settings.js<?php echo $updateCache;?>"></script>
		<script type="text/javascript" src="/assets/v3/rpws.js<?php echo $updateCache;?>"></script>
		<script type="text/javascript" src="/assets/v3/lib/js.cookie.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" integrity="sha384-npxfGiG5C/F5X72RqcKFYSfzr1AXsDiu1YC/ydsOrS+jL554Jh4zFAx9GpQi4lXQ" crossorigin="anonymous"></script>
		<script type="text/javascript" src="/assets/v3/viewmanager.js<?php echo $updateCache;?>"></script>
		
		<script src="https://romanport.com/api/PebbleRipper/assets/flickity.js"></script>
		<script type="text/javascript" src="/assets/v3/views/list/functions.js<?php echo $updateCache;?>"></script>
		<script type="text/javascript" src="/assets/v3/views/custom/vcustom.js<?php echo $updateCache;?>"></script>
		<script type="text/javascript" src="/assets/v3/views/item/item.js<?php echo $updateCache;?>"></script>
		<script type="text/javascript" src="/assets/v3/views/sort/sort.js<?php echo $updateCache;?>"></script>
		<script type="text/javascript" src="/assets/v3/shared/shared.js<?php echo $updateCache;?>"></script>

		<script>
			/* Add views after everything has loaded */
			viewman.addView("list",document.getElementById('view_list'),vlist.init,vlist.deinit,{},vlist.getTitle);
			viewman.addView("item",document.getElementById('item_view'),vitem.init,vitem.deinit,{}, "App");
			viewman.addView("sort",document.getElementById('newSortNull'),vsort.init,vsort.deinit,{customAnimation:vsort.null}, "Sort & Filter");
			viewman.addView("custom",document.getElementById('newSortNullCustom'),vcustom.init,vcustom.deinit,{customAnimation:vcustom.null},"Dialog");
		</script>
		<script type="text/javascript" src="/assets/v3/boot.js<?php echo $updateCache;?>"></script>
		<!-- End script init --> 
	</body>
</html>