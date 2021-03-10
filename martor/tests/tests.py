from django.test import TestCase
from martor.utils import markdownify, VersionNotCompatible


class SimpleTest(TestCase):

    def test_me(self):
        response = self.client.get('/test-form-view/')
        self.assertEqual(response.status_code, 200)

    def test_markdownify_error(self,):
        # This tests that real errors don't raise VersionNotCompatible
        #  errors, which could be misleading.
        try:
            markdownify(None)
        except Exception as e:
            self.assertNotIsInstance(e, VersionNotCompatible)
        else:
            self.fail("no assertion raised")
