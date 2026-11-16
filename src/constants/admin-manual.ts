/** Fixed training copy and video lesson catalogue for the admin (D189). */
export const ADMIN_MANUAL = [
  {
    title: "Getting started",
    lessons: [
      {
        id: "02-sign-in",
        title: "Sign in",
        duration: 18,
        steps: [
          "Open the admin sign-in page and enter your email and password. Choose Sign in.",
          "If you forget your password, choose Forgot your password? and follow the email reset link.",
        ],
        transcript:
          "Start at the admin sign-in page. Enter your email and password, then choose Sign in. This recording uses a separate training account. If you forget your password, use the reset link beneath the form to request a new one by email.",
      },
      {
        id: "03-dashboard",
        title: "Dashboard",
        duration: 20,
        steps: [
          "Start with Action required to see new submissions and failed team notifications.",
          "Choose All to review all arrivals, then open a row or use the menu to reach its full inbox.",
        ],
        transcript:
          "The Dashboard brings enquiries and applications into one list. Action required highlights new submissions and notification emails that were not delivered. Choose All to include items already being handled. The numbers in the sidebar help you see where attention is needed.",
      },
    ],
  },
  {
    title: "Enquiries",
    lessons: [
      {
        id: "04-enquiries",
        title: "Enquiries and filters",
        duration: 20,
        steps: [
          "Open Enquiries. Choose All forms, Quote requests or Messages.",
          "Use the status filters and Find to narrow the list. Open a row to read the submission.",
        ],
        transcript:
          "Open Enquiries for quote requests and contact messages. Filter by status, switch between quote requests and messages, or search by name, email, or phone. Selecting a row expands the original submission, so you can read it without leaving the inbox.",
      },
      {
        id: "05-enquiry-actions",
        title: "Contact and status",
        duration: 21,
        steps: [
          "Read the requested service, preferred contact method and message.",
          "Use Call, WhatsApp or Email to contact the sender. These open the relevant contact application.",
          "Move the enquiry to In progress while handling it, then Resolved when complete.",
        ],
        transcript:
          "Here are the details Sara submitted. Call, WhatsApp, and Email open the relevant contact method. Once you start following up, move the enquiry to In progress. When the request is finished, use Resolved. These statuses help keep the daily list useful.",
      },
      {
        id: "06-enquiry-notes",
        title: "Internal notes",
        duration: 17,
        steps: [
          "Open the enquiry and find Internal notes.",
          "Write the follow-up details under Add a note and choose Save note. Notes are for the team.",
        ],
        transcript:
          "Internal notes are for the team. Add a short record of your follow-up, then save it. The note stays with the enquiry, together with its author and time. This makes it easier to pick up the conversation later.",
      },
      {
        id: "07-notification",
        title: "Notification delivery",
        duration: 22,
        steps: [
          "Look for Team notification not delivered on an enquiry. The submission is still saved.",
          "Check the notification details and choose Retry when you want to resend the team email.",
          "Review Operations recipients if delivery keeps failing.",
        ],
        transcript:
          "A failed team notification does not mean the visitor lost their submission. The enquiry is still here. The site retries failed notifications automatically, up to three times. You can also use Resend notification. In this recording, we leave that control untouched.",
      },
      {
        id: "08-delete",
        title: "Delete confirmation",
        duration: 19,
        steps: [
          "Open the enquiry and choose Delete only when the record is no longer needed.",
          "Read the confirmation carefully. Cancel keeps it; confirming permanently removes the enquiry.",
        ],
        transcript:
          "Delete permanently removes an enquiry and its notes. The confirmation explains what will be lost before anything is removed. Choose Cancel if you only wanted to inspect the action. For ordinary follow-up, changing the status is usually enough.",
      },
    ],
  },
  {
    title: "Applications",
    lessons: [
      {
        id: "09-applications",
        title: "Applications",
        duration: 20,
        steps: [
          "Open Applications and filter by job or review status.",
          "Use Find to locate an applicant, then open their row to read contact details and answers.",
        ],
        transcript:
          "Applications has its own inbox. You can filter by job, search for an applicant, and follow progress from New, to In review, Shortlisted, and Closed. Open a row to see the submitted qualifications, experience, contact details, and CV.",
      },
      {
        id: "10-cv",
        title: "CVs and review",
        duration: 20,
        steps: [
          "Choose Download CV to open the saved file in your downloads.",
          "Move the application to In review, Shortlisted or the appropriate next status.",
          "Add an internal note and choose Save note to record review decisions.",
        ],
        transcript:
          "Download CV retrieves the applicant’s file for an authorised admin. Each download is recorded in Activity. If a CV has expired or could not be stored, its status explains that here. Move this sample application to In review, then record the next step.",
      },
      {
        id: "11-application-mail",
        title: "HR notifications and deletion",
        duration: 19,
        steps: [
          "If HR mail was not sent, review the notification and use Retry to resend it.",
          "For permanent removal, choose Delete and review the confirmation. Cancel keeps the application.",
          "Deleting an application also removes its stored CV.",
        ],
        transcript:
          "An application also shows whether its HR notification was delivered. Use Resend HR email when needed; an available CV is included with that email. Deleting an application removes its notes and CV as well, so review the confirmation carefully.",
      },
    ],
  },
  {
    title: "Pages and publishing",
    lessons: [
      {
        id: "12-pages",
        title: "Pages",
        duration: 19,
        steps: [
          "Open Pages and select the fixed website page you want to update.",
          "Check its publication state before editing. Each page has its own draft and published version.",
        ],
        transcript:
          "Pages contains the website’s eight fixed pages. Each row shows whether its content is published or has changes waiting. Open Home to edit its sections. The same save, preview, and publish pattern is used throughout the content editors.",
      },
      {
        id: "13-page-sections",
        title: "Sections and visibility",
        duration: 20,
        steps: [
          "Use Edit to open a section. Use Hide or Show to control visibility.",
          "Use the up/down controls or drag handle to reorder supported sections. The page header stays first.",
          "Remove a section only when intended; save and preview the draft before publishing.",
        ],
        transcript:
          "Each section is a separate row. Open it to edit its content. Hide keeps a section available in the editor while taking it out of the published layout. Move up, Move down, and drag handles control order. Changes take effect only after you publish.",
      },
      {
        id: "14-page-edit",
        title: "Editing a page",
        duration: 21,
        steps: [
          "Open the page header or another section and update its fields.",
          "Use the photo picker to choose an image. Update headings, supporting copy and buttons as needed.",
          "Supported copy accepts **bold**, *italic* and ***both***. Contact details, URLs and SEO fields use plain text.",
        ],
        transcript:
          "The page header contains the home slides: their photographs, headlines, supporting text, and optional buttons. Let’s make a small wording change to the first slide. Website copy also supports bold and italic formatting; the hint above the editor shows the notation.",
      },
      {
        id: "15-save",
        title: "Save draft",
        duration: 16,
        steps: [
          "Choose Save draft after editing.",
          "Check the saved state. Saving keeps changes for review; visitors continue to see the published version.",
        ],
        transcript:
          "Choose Save draft to keep the edit without changing the public website. The status now says Changes not published. This separation gives you time to check wording and images before visitors see the update.",
      },
      {
        id: "16-preview",
        title: "Private preview",
        duration: 18,
        steps: [
          "Choose Preview to inspect the draft on the website. Unsaved edits are saved first.",
          "Check headings, images, links and layout, then use Exit preview when finished.",
        ],
        transcript:
          "Preview opens the actual website with your draft content. The preview banner reminds you that you are viewing unpublished changes. Check the page as a visitor would, including text, photographs, and buttons, before returning to the editor.",
      },
      {
        id: "17-publish",
        title: "Publish confirmation",
        duration: 19,
        steps: [
          "Save and preview the page, then choose Publish.",
          "Review and confirm the publish action. Check that the state becomes Published. The public website now uses this version.",
        ],
        transcript:
          "Back in the editor, choose Publish. The confirmation makes it clear that the saved changes will go live. Confirming publishes this page. Other pages and content items keep their own drafts, so they are not published by this action.",
      },
      {
        id: "18-add-seo",
        title: "Section catalogue and SEO",
        duration: 19,
        steps: [
          "Use Add a section to choose from the section types supported by this page.",
          "Set the optional SEO title, description and sharing image under Search engines and sharing.",
          "Save, preview and publish when ready. Empty SEO fields use the page and site defaults.",
        ],
        transcript:
          "At the bottom, Add a section lists the section types this page supports. Add the one you need, then fill in its content. Search engines and sharing holds the page’s title and description. Empty fields use the documented defaults shown beside them.",
      },
      {
        id: "19-discard",
        title: "Discard draft",
        duration: 21,
        steps: [
          "Choose Discard draft when you want to return to the published version.",
          "Confirm only if the draft edits can be lost.",
          "If a cleared optional field still shows old text, reload the editor to see its restored value.",
        ],
        transcript:
          "If you decide against an edit, Discard draft restores the published version. Here, we save a temporary search title, then discard it. The confirmation protects against losing work accidentally. Discard affects unpublished changes, not the page that is already live.",
      },
    ],
  },
  {
    title: "Services",
    lessons: [
      {
        id: "20-services",
        title: "Services",
        duration: 20,
        steps: [
          "Open Services to review the list and each publication state.",
          "Create a service or open an existing one. Use ordering controls to arrange services, then publish the order separately.",
        ],
        transcript:
          "Services manages the individual care services shown on the website. Add a service, open an existing one, or reorder the list. The ordering has its own publishing action. Opening Home Nursing Care shows the details behind its public service page.",
      },
      {
        id: "21-service-editor",
        title: "Service details",
        duration: 23,
        steps: [
          "Edit the service name, summary, page header, photo and supported content fields.",
          "Review its audience and SEO fields. Save draft, preview and publish the service when ready.",
        ],
        transcript:
          "Edit the name, web address, summary, and photo here. The description supports paragraphs, headings, lists, and links. You can also manage included items, optional header buttons, and search information. Save a draft, preview the service page, then publish when it is ready.",
      },
      {
        id: "22-service-archive",
        title: "Archive and restore",
        duration: 17,
        steps: [
          "Open the service and find Archive.",
          "Read the confirmation before proceeding. Archiving removes the service from the public website; Cancel keeps it active.",
          "To bring it back, expand Archived in Services, open the service and choose Restore. Review the confirmation before continuing.",
        ],
        transcript:
          "Archive immediately removes a service from the website while keeping its record in the admin. The confirmation explains the effect. Archived records can be restored later. We will cancel here and keep this service available.",
      },
    ],
  },
  {
    title: "Jobs",
    lessons: [
      {
        id: "23-jobs",
        title: "Jobs",
        duration: 19,
        steps: [
          "Open Jobs and use status filters to review openings.",
          "Choose a new job or open an existing job, then edit its title, employment details and introduction.",
        ],
        transcript:
          "Jobs controls the vacancies on Careers. Create a new job, or open an existing one to edit its title, department, location, employment type, experience, and summary. The posting and closing dates determine when a vacancy is available.",
      },
      {
        id: "24-job-details",
        title: "Job requirements and closing",
        duration: 24,
        steps: [
          "Update duties, qualifications, benefits and SEO using the item controls.",
          "In Application questions, hide any predefined questions you don't need. Applicants can skip the ones you show.",
          "For each custom question, add at least two choices and set Answer selection to One answer or Multiple answers. Applicants must select at least one.",
          "Save draft, preview and publish when the opening is ready.",
          "Choose Close now to stop new applications, or Archive to remove the listing. Review each confirmation first.",
        ],
        transcript:
          "Continue with the description, responsibilities, qualifications, benefits, and search text. Close now stops new applications while leaving the vacancy visible as closed. You can reopen it later. Archive removes it from the website. Each action explains its effect before you confirm.",
      },
    ],
  },
  {
    title: "Client logos",
    lessons: [
      {
        id: "25-clients",
        title: "Client logos",
        duration: 21,
        steps: [
          "Open Client logos. Add a client or open an existing one.",
          "Enter the organisation name, choose its logo and optionally set its website link.",
          "Save and publish the client. Arrange and publish the logo order separately; use Archive to remove one from the website.",
        ],
        transcript:
          "Client logos has a familiar list and ordering workflow. Each client has an organisation name, logo, and optional website link. Choose a logo from the media library, preview the result, and publish. Only show organisations whose logo use has been approved.",
      },
    ],
  },
  {
    title: "Media library",
    lessons: [
      {
        id: "26-media",
        title: "Media library",
        duration: 20,
        steps: [
          "Open Media library and search for the image by its description.",
          "Open an image to review its alt text and where it is used.",
          "Update its description as needed. An image still in use cannot be deleted; remove its references first.",
        ],
        transcript:
          "The Media library holds website photographs and logos. Search by their descriptions, then open an image to see its details and where it is used. Usage information helps you understand the effect of a change. An image that is still in use cannot be deleted.",
      },
      {
        id: "27-upload",
        title: "Image uploads",
        duration: 23,
        steps: [
          "Choose Upload an image and select a JPEG, PNG, WebP or AVIF file up to 10 MB.",
          "Provide meaningful alt text, then submit the upload and wait for completion.",
          "The image can then be selected from page, service or client photo pickers.",
        ],
        transcript:
          "Upload an image accepts JPEG, PNG, WebP, or AVIF files up to ten megabytes. Write useful alt text describing the image, or mark it decorative when appropriate. The website creates the sizes it needs. We are showing the upload form without adding another copy.",
      },
    ],
  },
  {
    title: "Site settings",
    lessons: [
      {
        id: "28-settings",
        title: "Company and contact settings",
        duration: 22,
        steps: [
          "Open Settings and edit the company details, contact information and location fields.",
          "Check phone numbers, email addresses and map details carefully. Save draft and preview before publishing.",
        ],
        transcript:
          "Settings contains information shared across the website. Update the company name and description, phone, WhatsApp, email, address, and hours. The map link and office coordinates control the location information. These content changes use the same draft and publish workflow.",
      },
      {
        id: "29-social",
        title: "Social links and WhatsApp",
        duration: 19,
        steps: [
          "In Settings, add or update social links and choose the network for each.",
          "Use the item controls to reorder or remove links. Set whether the floating WhatsApp button is shown.",
          "Save, preview and publish the settings.",
        ],
        transcript:
          "Social links can be added, reordered, or removed. Choose the network and enter its full profile address. The WhatsApp switch controls the floating contact button on the website. Saving these changes keeps them as a draft until Settings is published.",
      },
      {
        id: "30-navigation",
        title: "Header and footer",
        duration: 20,
        steps: [
          "In Settings, edit the header menu link labels, destinations, visibility and order.",
          "Review the footer links and text. Save draft, preview the navigation on the website and publish.",
        ],
        transcript:
          "The Header menu lets you change link wording, destinations, order, and visibility. Hiding a link keeps it here for later. The Footer uses columns with their own headings and links. Review navigation carefully in Preview before publishing site-wide changes.",
      },
      {
        id: "31-brochure",
        title: "Search defaults and brochure",
        duration: 20,
        steps: [
          "Review default SEO and sharing details in Settings. Individual pages can override these.",
          "Use the brochure control to select a valid PDF up to 10 MB when replacing the brochure.",
          "Save draft, preview and publish the settings.",
        ],
        transcript:
          "The search defaults supply a title and description when a page has no override. Brochure holds the current company PDF. Upload a replacement of up to ten megabytes, then publish Settings. The website’s brochure address stays the same when the file changes.",
      },
    ],
  },
  {
    title: "Font Manager",
    lessons: [
      {
        id: "32-fonts",
        title: "Font Manager",
        duration: 21,
        steps: [
          "Open Font Manager and choose a bundled font for each public website text role.",
          "Use the previews to compare readability. The admin panel font stays the same.",
        ],
        transcript:
          "Font Manager chooses the font family for each public text type. There are fifteen bundled fonts across twenty roles, including page titles, paragraphs, buttons, and form fields. Sizes, spacing, colours, and the admin’s own font remain consistent with the design.",
      },
      {
        id: "33-font-workflow",
        title: "Font previews and independent publishing",
        duration: 20,
        steps: [
          "Save the font draft and preview the website before publishing.",
          "Publish the font choices separately when ready, or discard them to return to published fonts.",
        ],
        transcript:
          "Each sample updates as you choose a font. Save a draft and preview the real pages to check readability. Font changes publish independently from Settings. For this demonstration, we save the choice, then discard it to restore the published typography.",
      },
    ],
  },
  {
    title: "Operations",
    lessons: [
      {
        id: "34-operations",
        title: "Email recipients",
        duration: 21,
        steps: [
          "Open Operations and set the team recipients for enquiries and applications.",
          "Check each email address, then save. Operations changes take effect immediately; they do not use draft publishing.",
        ],
        transcript:
          "Operations controls how the site runs. The recipient lists decide who receives Quote and Contact notifications, and who receives application emails. Each list supports one to five addresses. Unlike content drafts, Operations changes take effect when you save them.",
      },
      {
        id: "35-retention",
        title: "Retention and storage",
        duration: 22,
        steps: [
          "Review storage usage before uploading more images or CVs.",
          "Set enquiry/application retention and CV expiry within the allowed 1–365 days.",
          "Read the confirmation before shortening retention: the scheduled cleanup permanently removes expired records and files.",
        ],
        transcript:
          "Retention controls how long enquiries and applications are kept. CV expiry is separate, so files can expire sooner. Both accept one to three hundred and sixty-five days. Storage meters show media and CV usage, and the clean-up section reports the latest nightly run.",
      },
    ],
  },
  {
    title: "Activity and your account",
    lessons: [
      {
        id: "36-activity",
        title: "Activity log",
        duration: 21,
        steps: [
          "Open Activity log to review recorded admin changes by day.",
          "Filter by content, inbox, settings or sign-ins to find the action you need. The log records actions rather than private submission contents.",
        ],
        transcript:
          "Activity records admin changes with the person, action, and time. Use the filters to review content changes, inbox work, settings, or sign-ins. This is where you can trace the work we have just completed. Personal submission details are kept out of the log.",
      },
      {
        id: "37-profile",
        title: "Profile and account security",
        duration: 18,
        steps: [
          "Open Profile to review your sign-in email and update your name. Choose Save name.",
          "To change your password, enter the current password and the new password twice, then choose Save new password. Other sessions will be signed out.",
        ],
        transcript:
          "Profile holds your account name and password controls. The sign-in email is shown for reference. To change your password, enter the current password and the new one twice. Saving a new password signs out your other sessions.",
      },
      {
        id: "38-signout",
        title: "Sign out",
        duration: 18,
        steps: [
          "Save any work you want to keep, then choose Log out.",
          "Confirm the action to return to the sign-in page.",
        ],
        transcript:
          "When you finish, choose Log out and confirm. Your everyday routine is simple: check new submissions, record your follow-up, and keep content changes in draft until you have previewed them. Publish only when you are happy with the result.",
      },
    ],
  },
] as const;
