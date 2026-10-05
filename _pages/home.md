---
permalink: /
title: "About me"
description: "Shifan Yu — undergraduate student in Applied Physics at Xi'an Jiaotong University, with interests in quantum computing, machine learning, and condensed matter theory."
author_profile: true
---

{% include about-me.md %}

## Research interests

{% include research-interests.html %}

<a class="text-link" href="{{ '/research/' | relative_url }}">More about my research</a>

## Selected publications

{% assign selected = site.data.publications | where: 'selected', true %}
{% if selected.size > 0 %}
<ul class="selected-publication-list">
  {% for post in selected %}{% include selected-publication-entry.html post=post %}{% endfor %}
</ul>
{% else %}
<div class="empty-state"><p>Selected publications will be added here.</p></div>
{% endif %}

<a class="text-link" href="{{ '/publications/' | relative_url }}">All publications</a>

## News

{% assign news = site.data.news | sort: 'date' | reverse %}
{% if news.size > 0 %}
<ul class="news-list">
{% for item in news limit:5 %}
  {% include news-entry.html item=item date_format="%b %Y" %}
{% endfor %}
</ul>

<a class="text-link" href="{{ '/news/' | relative_url }}">All news</a>
{% else %}
<p class="muted">Research updates will appear here.</p>
{% endif %}
