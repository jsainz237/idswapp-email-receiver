import { readFile, writeFile } from 'fs/promises';
import { processEmail } from '../process-email.mjs';
import path from 'path';
import config from '../config.mjs';

const forwardingEmail = config.SES_MAIL_FROM;
const forwardToEmail = "test@example.com";

describe("processEmail", () => {
  describe("independent tests", () => {
    let emailData;
    const getEmailData = async () => readFile(path.resolve("test/util/example.eml"), "utf-8");
    
    beforeEach(async () => {
      emailData = await getEmailData();
    });

    it("Should replace the 'To' header", () => {
      const modifiedEmail = processEmail(emailData, forwardToEmail);
      expect(modifiedEmail).toMatch(`To: ${forwardToEmail}`);
    });

    it("Should remove the 'Message-ID' header", () => {
      const modifiedEmail = processEmail(emailData, forwardToEmail);
      expect(modifiedEmail).not.toMatch(/^Message-ID: .*\r?\n/m);
    });

    it("Should remove the 'Return-Path' header", () => {
      const modifiedEmail = processEmail(emailData, forwardToEmail);
      expect(modifiedEmail).not.toMatch(/^Return-Path: .*\r?\n/m);
    });

    it("should remove the DKIM signature", () => {
      const modifiedEmail = processEmail(emailData, forwardingEmail);
      expect(modifiedEmail).not.toMatch(/^DKIM-Signature:/m);
    });
  });
  describe("With a name", () => {
    let emailData;
    const getEmailData = async () => readFile(path.resolve("test/util/example.eml"), "utf-8");
    const writeModifiedData = async (data) => writeFile(path.resolve("test/util/modified.eml"), data);

    (async () => {
      emailData = await getEmailData();
      const modifiedEmail = processEmail(emailData, forwardToEmail);
      await writeModifiedData(modifiedEmail);
    })();

    beforeEach(async () => {
      emailData = await getEmailData();
    });

    it("Should replace the 'From' header", () => {
      expect(forwardingEmail).toBeDefined();

      const modifiedEmail = processEmail(emailData, forwardToEmail);
      expect(modifiedEmail).toMatch(`From: Jesse Sainz (jsainz236@gmail.com) via IDSwapp <${forwardingEmail}>`);
    });

    it("Should add the 'Reply-To' header", () => {
      const modifiedEmail = processEmail(emailData, forwardToEmail);
      expect(modifiedEmail).toMatch(`Reply-To: Jesse Sainz <jsainz236@gmail.com>`);
    });
  });

  describe("Without a name", () => {
    let emailData;
    const getEmailData = async () => readFile(path.resolve("test/util/example2.eml"), "utf-8");
    const writeModifiedData = async (data) => writeFile(path.resolve("test/util/modified2.eml"), data);

    (async () => {
      emailData = await getEmailData();
      const modifiedEmail = processEmail(emailData, forwardToEmail);
      await writeModifiedData(modifiedEmail);
    })();

    beforeEach(async () => {
      emailData = await getEmailData();
    });

    it("Should replace the 'From' header", () => {
      expect(forwardingEmail).toBeDefined();

      const modifiedEmail = processEmail(emailData, forwardToEmail);
      expect(modifiedEmail).toMatch(`From: jsainz236@gmail.com via IDSwapp <${forwardingEmail}>`);
    });

    it("Should add the 'Reply-To' header", () => {
      const modifiedEmail = processEmail(emailData, forwardToEmail);
      expect(modifiedEmail).toMatch(`Reply-To: <jsainz236@gmail.com>`);
    });
  });
});
