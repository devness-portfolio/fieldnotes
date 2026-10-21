import unittest, tempfile, io, json, urllib.error
from unittest.mock import patch
from pathlib import Path
import server
class BackendTests(unittest.TestCase):
    def test_repo_identity(self):
        self.assertEqual(server.repo_key('git@github.com:devness-portfolio/example.git'),server.repo_key('https://github.com/devness-portfolio/example'))
    def test_issues_excludes_pull_requests(self):
        rows=[{'number':1,'title':'Fix <layout>','labels':[{'name':'bug'}]}, {'number':2,'title':'PR','pull_request':{}}]
        with patch('server.urllib.request.urlopen',return_value=io.BytesIO(json.dumps(rows).encode())) as request:
            result=server.issues({'repo':'git@github.com:owner/project.git'})
        self.assertEqual(result['issues'],[{'number':1,'title':'Fix <layout>','url':'https://github.com/owner/project/issues/1','labels':['bug']}])
        self.assertIn('/repos/owner/project/issues?',request.call_args.args[0].full_url)
    def test_issues_invalid_repository(self):
        with patch('server.urllib.request.urlopen') as request:
            self.assertIn('warning',server.issues({'repo':'https://github.com.evil.test/o/r'}))
            request.assert_not_called()
    def test_issues_access_failure(self):
        with patch('server.urllib.request.urlopen',side_effect=urllib.error.HTTPError('url',404,'missing',{},None)):
            result=server.issues({'repo':'https://github.com/o/r'})
        self.assertEqual(result['issues'],[])
        self.assertIn('private',result['warning'])
    def test_issues_empty_and_network_failure(self):
        with patch('server.urllib.request.urlopen',return_value=io.BytesIO(b'[]')):
            self.assertEqual(server.issues({'repo':'https://github.com/o/r'})['issues'],[])
        with patch('server.urllib.request.urlopen',side_effect=urllib.error.URLError('offline')):
            self.assertIn('connection',server.issues({'repo':'https://github.com/o/r'})['warning'])
    def test_persistence(self):
        old=server.DATA
        with tempfile.TemporaryDirectory() as d:
            server.DATA=Path(d)/'projects.json'
            try:
                self.assertEqual(server.read(),[])
                project={'id':'one','title':'Example','tasks':[{'title':'Ship','done':True}]}
                server.save([project]); self.assertEqual(server.read(),[project])
            finally: server.DATA=old
    def test_non_git_handoff(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'.project-dashboard';p.mkdir();(p/'handoff.md').write_text('Next: finish discovery')
            c=server.context({'path':d})
            self.assertEqual(c['handoff'],'Next: finish discovery');self.assertEqual(c['commits'],[])
if __name__=='__main__':unittest.main()
