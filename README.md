# Architecture

![Architecture](README.images/architecture.svg "Architecture")

# Demo

Visit live demo at https://demo-gallery.aniskov.com/
Sign in there using user name ```username```, and password ```password```.

Upon signing in you will see following starting page.

![Demo photo gallery starting page](README.images/demo-starting-page.png "Demo photo gallery starting page")

# Using

The figure above shows so called browse mode when you see thumbnails of images and navigate folders.

Click subfolder tile to jump to content of the folder.

![Subfolder tile](README.images/subfolder-tile.png "Subfolder tile")

When you're in a subfolder you see arrow tile which will navigate you back to parent folder.

![Arrow tile](README.images/arrow-tile.png "Arrow tile")

Click image thumbnail tile to start viewing photos full-screen.

While it is in full-screen image viewing mode use keyboard keys
```Arrow Left/Right/Up/Down```, ```Page Up/Down```, ```Space```, and ```Enter```,
or swipe left/right on touch screen devices,
to navigate forth and back through the gallery.

Click right mouse button, or long tap touch screen, to pop up context menu.

Use context menu to switch back to browse mode or sign out.

![Context menu](README.images/context-menu.png "Context menu")

# Installing

## Prerequisites

1. Optional. Decide on public domain name for gallery's web UI. If omitted, gallery is accessible at CloudFront provided domain name cloudfront.net

1. Optional. Create an ACM public certificate for the domain name. See AWS Certificate Manager
[User Guide](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html)

1. Decide on S3 bucket where you store your image files. That can be any existing bucket, or you create a new one. Optionally you provide prefix (path) which will make the application to filter non-matching files out.

1. [Create CloudFront key pair](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-trusted-signers.html#private-content-creating-cloudfront-key-pairs) to be used for signing cookies. Download private key file and make a note of id of the pair.

## Deploy Serverless Application

[Click this link](https://console.aws.amazon.com/lambda/home#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:425828444339:applications/photo-gallery)
to open the application in AWS Serverless Application Repository console.

In the console's top menu select region.

Scroll down to Application settings. Fill in settings.

Scroll down to find Deploy button. Click it.

## Manual steps to be taken after deployment

1. Pay attention that stack you created got prefix _serverlessrepo-_ to its name automatically.
<br/>Create SSM parameter of Secure String type with name /_stack-name_/CLOUD_FORMATION_PRIVATE_KEY replacing _stack-name_ with your value, e.g. _serverlessrepo-photo-galery_.
<br/>Set its value to CloudFront private key (see Prerequisites) preserving newline characters.
You can do that with following AWS CLI command (don't forget to replace _stack-name_!) 
> aws ssm put-parameter --type SecureString --name /_stack-name_/CLOUD_FORMATION_PRIVATE_KEY --value file://_private_key.pem_

2. The application leverages awesome [Serverless Image Handler by AWS](https://github.com/awslabs/serverless-image-handler) which by default is configured to send usage data to AWS. In case you don't want posting such data to AWS, open AWS Lambda Console, find ```ServerlessImage-ImageHandlerFunction``` function, open it for editing, go to Environment variables, and set ```SEND_ANONYMOUS_DATA``` to ```No```.

1. Optional. If you chose to use a custom public domain name,
find stack in CloudFormation console,
on its Output tab find CloudFrontDistributionDomainName.
Configure your DNS to point domain name you chose to that.

1. Find stack in CloudFormation console. On its Output tab find GalleryUrl.

1. Optional. Use Amazon Cognito Console to administer your users.
User database is in Cognito User Pool.
Find your User Pool id among CloudFormation stack's outputs.

# Credits

This works uses [AWS Serverless Image Handler Lambda wrapper for Thumbor](https://github.com/awslabs/serverless-image-handler).

Demo gallery uses images by
[Free-Photos](https://pixabay.com/users/Free-Photos-242387/),
[Albert Dezetter](https://pixabay.com/users/DEZALB-1045091/),
[engin akyurt](https://pixabay.com/users/Engin_Akyurt-3656355/),
[Michelle Maria](https://pixabay.com/users/Mariamichelle-165491/),
[Jon Toy](https://pixabay.com/users/jtyoder-601591/),
[Peter Vandecaveye](https://pixabay.com/users/Connectingdots-919354/)
from [Pixabay](https://pixabay.com/).

***
Copyright 2019 Maksim Aniskov MaksimAniskov@gmail.com Read LICENSE.txt