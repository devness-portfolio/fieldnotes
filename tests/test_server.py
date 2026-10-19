import unittest, tempfile
from pathlib import Path
import server
class BackendTests(unittest.TestCase):
    def test_repo_identity(self):
        self.assertEqual(server.repo_key('git@github.com:devness/example.git'),server.repo_key('https://github.com/devness/example'))
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
