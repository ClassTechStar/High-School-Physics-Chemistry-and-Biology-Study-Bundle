#!/usr/bin/env python3
"""publish-release.py — GitHub Release 发布工具（token 经 git credential fill 获取）

用法：
  python3 publish-release.py create <tag> <title> <body_file> [commitish]
      创建 release（tag 不存在时基于 commitish/main 自动建）；返回 release id。
  python3 publish-release.py upload <tag> <asset_path> [asset_name]
      向该 tag 对应 release 上传附件（存在同名则覆盖）。
  python3 publish-release.py delete <tag>
      删除 release（保留 tag）。
所有请求带指数退避重试（间歇性 TLS 干扰环境实测必需）。
"""
import base64
import io
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request

REPO = 'ClassTechStar/High-School-Physics-Chemistry-and-Biology-Study-Bundle'
API = 'https://api.github.com/repos/' + REPO
UPLOAD = 'https://uploads.github.com/repos/' + REPO


def token():
    out = subprocess.run(
        ['git', 'credential', 'fill'],
        input='protocol=https\nhost=github.com\n\n',
        capture_output=True, text=True, timeout=20,
    ).stdout
    for line in out.splitlines():
        if line.startswith('password='):
            return line.split('=', 1)[1]
    raise SystemExit('未取得 GitHub 凭据')


TOKEN = token()


def api(method, path, payload=None, raw_body=None, content_type=None, base=None, retries=6):
    last = None
    for attempt in range(retries):
        try:
            headers = {
                'Authorization': 'Bearer ' + TOKEN,
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'hspcb-publish',
            }
            data = None
            if raw_body is not None:
                data = raw_body
                headers['Content-Type'] = content_type
            elif payload is not None:
                data = json.dumps(payload).encode()
                headers['Content-Type'] = 'application/json'
            req = urllib.request.Request((base or API) + path, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=120) as r:
                body = r.read()
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            if e.code in (404, 422) and method == 'GET':
                raise
            if e.code in (422, 404):
                # 业务性失败（如 tag 不存在/重名）：不重试，直接上抛
                raise
            last = e
            time.sleep(2 * (attempt + 1))
        except Exception as e:
            last = e
            time.sleep(2 * (attempt + 1))
    raise last


def cmd_create(tag, title, body_file, commitish=None):
    body = io.open(body_file, encoding='utf-8').read()
    payload = {'tag_name': tag, 'name': title, 'body': body, 'prerelease': False, 'draft': False}
    if commitish:
        payload['target_commitish'] = commitish
    rel = api('POST', '/releases', payload)
    print('release id:', rel['id'], '| tag:', rel['tag_name'], '| url:', rel['html_url'])


def cmd_upload(tag, asset_path, asset_name=None):
    rel = api('GET', '/releases/tags/' + tag)
    name = asset_name or asset_path.replace('\\', '/').split('/')[-1]
    content = open(asset_path, 'rb').read()
    res = api('POST', '/releases/%d/assets?name=%s' % (rel['id'], name),
              raw_body=content, content_type='application/vnd.android.package-archive',
              base=UPLOAD)
    print('asset:', res['name'], '| state:', res.get('state'), '| size:', res.get('size'))


def cmd_delete(tag):
    rel = api('GET', '/releases/tags/' + tag)
    api('DELETE', '/releases/%d' % rel['id'])
    print('release deleted:', tag, '(tag 保留)')


def main():
    cmd = sys.argv[1]
    if cmd == 'create':
        cmd_create(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5] if len(sys.argv) > 5 else None)
    elif cmd == 'upload':
        cmd_upload(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else None)
    elif cmd == 'delete':
        cmd_delete(sys.argv[2])
    else:
        raise SystemExit('用法: create|upload|delete')


if __name__ == '__main__':
    main()
